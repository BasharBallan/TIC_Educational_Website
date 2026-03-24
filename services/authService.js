const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const getMessage = require("../utils/getMessage");
const UserSession = require("../models/userSessionModel");
const { getRealIp, getGeoLocation } = require("../utils/network");


// ======================================================================
// TOKEN HELPERS (Access / Refresh Tokens + Session Creation)
// ======================================================================

// Create short-lived access token
const createAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

// Create long-lived refresh token
const createRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

// Create a new session entry in DB for refresh token rotation
const createSession = async (userId, refreshToken, req) => {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  const expiresInMs =
    (process.env.JWT_REFRESH_EXPIRES_IN_DAYS
      ? Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS)
      : 30) *
    24 * 60 * 60 * 1000;

  await UserSession.create({
    user: userId,
    refreshTokenHash,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    expiresAt: new Date(Date.now() + expiresInMs),
  });
};

// Set refresh token cookie (HTTP-only)
const setRefreshTokenCookie = (res, refreshToken) => {
  const maxAgeMs =
    (process.env.JWT_REFRESH_EXPIRES_IN_DAYS
      ? Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS)
      : 30) *
    24 * 60 * 60 * 1000;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAgeMs,
  });
};


// ======================================================================
// DEVICE ALERT SYSTEM (Detect new device/IP and send email)
// ======================================================================

const checkNewDeviceAndSendAlert = async (userId, normalizedUA, ip) => {
  try {
    const existingSession = await UserSession.findOne({
      user: userId,
      userAgent: normalizedUA,
      ip,
    });

    // If session already exists → no alert needed
    if (existingSession) return;

    const user = await User.findById(userId);
    if (!user) return;

    // Send email alert
    sendEmail({
      email: user.email,
      subject: "New Login Detected",
      html: `
        <h2>New Login Detected</h2>
        <p>Hello ${user.name},</p>
        <p>A new login to your account was detected:</p>
        <ul>
          <li><strong>Device:</strong> ${normalizedUA}</li>
          <li><strong>IP:</strong> ${ip}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>If this wasn't you, please reset your password immediately.</p>
      `,
    }).catch(() => {});
  } catch (err) {}
};


// ======================================================================
// AUTH: STUDENT SIGNUP
// ======================================================================

// ------------------------------------------------------
// @desc    Student Signup
// @route   POST /api/v1/auth/signup
// @access  Public
// ------------------------------------------------------
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, studentNumber, year, semester } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: "Email already in use",
    });
  }

  // Create student account
  const student = await User.create({
    name,
    email,
    password,
    role: "student",
    studentData: {
      studentNumber,
      year,
      semester,
    },
  });

  // Generate tokens + session
  const accessToken = createAccessToken(student._id);
  const refreshToken = createRefreshToken(student._id);
  await createSession(student._id, refreshToken, req);
  setRefreshTokenCookie(res, refreshToken);

  student.password = undefined;

  res.status(201).json({
    status: "success",
    message: "Signup successful",
    data: student,
    token: accessToken,
  });
});


// ======================================================================
// AUTH: LOGIN (Students + Doctors)
// ======================================================================

// ------------------------------------------------------
// @desc    Login (Students & Doctors)
// @route   POST /api/v1/auth/login
// @access  Public
// ------------------------------------------------------
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ApiError("Incorrect email or password", 401));

  // Validate password
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return next(new ApiError("Incorrect email or password", 401));

  // Create tokens
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  // Device + IP detection
  const rawUA = req.headers["user-agent"] || "Unknown Device";
  const normalizedUA = rawUA.slice(0, 40);

  const ip = await getRealIp(req);
  const location = await getGeoLocation(ip);

  await checkNewDeviceAndSendAlert(user._id, normalizedUA, ip);

  // Save session
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await UserSession.create({
    user: user._id,
    refreshTokenHash,
    userAgent: normalizedUA,
    ip,
    location,
    lastUsedAt: new Date(),
    expiresAt: new Date(
      Date.now() +
        parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || "30") *
          24 * 60 * 60 * 1000
    ),
  });

  // Set cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || "30") *
      24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    message: "Logged in successfully.",
    data: user,
    token: accessToken,
  });
});


// ======================================================================
// AUTH: ADMIN SIGNUP
// ======================================================================

// ------------------------------------------------------
// @desc    Create Admin (one-time setup)
// @route   POST /api/v1/auth/adminSignup
// @access  Public (should be removed after first use)
// ------------------------------------------------------
exports.AdminSignup = asyncHandler(async (req, res, next) => {
  const adminUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: "admin",
  });

  const accessToken = createAccessToken(adminUser._id);
  const refreshToken = createRefreshToken(adminUser._id);
  await createSession(adminUser._id, refreshToken, req);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: "success",
    message: getMessage("admin_signup_success", req.lang),
    data: adminUser,
    token: accessToken,
  });
});


// ======================================================================
// AUTH: ADMIN LOGIN
// ======================================================================

// ------------------------------------------------------
// @desc    Admin Login
// @route   POST /api/v1/auth/adminLogin
// @access  Public
// ------------------------------------------------------
exports.Adminlogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "admin" }).select("+password");
  if (!admin) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const isCorrectPassword = await bcrypt.compare(password, admin.password);
  if (!isCorrectPassword) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const accessToken = jwt.sign(
    { userId: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: admin._id, role: admin.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    "Unknown IP";

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await UserSession.create({
    user: admin._id,
    refreshTokenHash,
    userAgent,
    ip,
    expiresAt: new Date(
      Date.now() +
        parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || "30") *
          24 * 60 * 60 * 1000
    ),
  });

  await checkNewDeviceAndSendAlert(admin._id, req);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || "30") *
      24 * 60 * 60 * 1000,
  });

  admin.password = undefined;

  res.status(200).json({
    status: "success",
    message: "Admin logged in successfully.",
    data: admin,
    token: accessToken,
  });
});


// ======================================================================
// MIDDLEWARE: PROTECT ROUTES
// ======================================================================

// ------------------------------------------------------
// @desc    Protect routes (JWT Authentication)
// @access  Private
// ------------------------------------------------------
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(getMessage("not_logged_in", req.lang), 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError(getMessage("user_not_exist", req.lang), 401));
  }

  // Check if password changed after token was issued
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError(getMessage("password_changed", req.lang), 401));
    }
  }

  req.user = currentUser;
  next();
});


// ======================================================================
// MIDDLEWARE: ROLE-BASED AUTHORIZATION
// ======================================================================

// ------------------------------------------------------
// @desc    Role-based Authorization
// @access  Private (depends on allowed roles)
// ------------------------------------------------------
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(getMessage("unauthorized", req.lang), 403));
    }
    next();
  });


// ======================================================================
// REFRESH TOKEN (ROTATION)
// ======================================================================

// ------------------------------------------------------
// @desc    Refresh Access Token (Token Rotation)
// @route   POST /api/v1/auth/refresh
// @access  Public
// ------------------------------------------------------
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const oldRefreshToken = req.cookies && req.cookies.refreshToken;

  if (!oldRefreshToken) {
    return next(new ApiError(getMessage("not_logged_in", req.lang), 401));
  }

  let payload;
  try {
    payload = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new ApiError(getMessage("invalid_credentials", req.lang), 401));
  }

  const sessions = await UserSession.find({ user: payload.userId });

  let currentSession = null;
  for (const session of sessions) {
    const isMatch = await bcrypt.compare(
      oldRefreshToken,
      session.refreshTokenHash
    );
    if (isMatch) {
      currentSession = session;
      break;
    }
  }

  if (!currentSession) {
    return next(new ApiError(getMessage("not_logged_in", req.lang), 401));
  }

  await UserSession.deleteOne({ _id: currentSession._id });

  const newAccessToken = createAccessToken(payload.userId);
  const newRefreshToken = createRefreshToken(payload.userId);

  await createSession(payload.userId, newRefreshToken, req);
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    status: "success",
    token: newAccessToken,
  });
});


// ======================================================================
// LOGOUT (ALL SESSIONS)
// ======================================================================

// ------------------------------------------------------
// @desc    Logout (invalidate all sessions for user)
// @route   POST /api/v1/auth/logout
// @access  Public
// ------------------------------------------------------
exports.logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies && req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      await UserSession.deleteMany({ user: payload.userId });
    } catch (err) {}
  }

  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: getMessage("logout_success", req.lang) || "Logged out successfully",
  });
});


// ======================================================================
// FORGOT PASSWORD (SEND RESET CODE)
// ======================================================================

// ------------------------------------------------------
// @desc    Send password reset code to email
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
// ------------------------------------------------------
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(getMessage("no_user_with_email", req.lang), 404));
  }

  // Generate reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // Email template
  const htmlMessage = `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Password Reset Code</h2>
      <p>Your reset code is:</p>
      <h1>${resetCode}</h1>
      <p>Valid for 10 minutes.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code",
      html: htmlMessage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError(getMessage("email_send_error", req.lang), 500));
  }

  res.status(200).json({
    status: "success",
    message: getMessage("reset_code_sent", req.lang),
  });
});


// ======================================================================
// VERIFY RESET CODE
// ======================================================================

// ------------------------------------------------------
// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
// ------------------------------------------------------
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(getMessage("reset_code_invalid", req.lang), 400));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: getMessage("reset_code_verified", req.lang),
  });
});

// ======================================================================
// RESET PASSWORD
// ======================================================================

// ------------------------------------------------------
// @desc    Reset password after verification
// @route   POST /api/v1/auth/resetPassword
// @access  Public
// ------------------------------------------------------
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Find user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(getMessage("no_user_with_email", req.lang), 404));
  }

  // Ensure reset code was verified
  if (!user.passwordResetVerified) {
    return next(new ApiError(getMessage("reset_code_not_verified", req.lang), 400));
  }

  // Update password
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // Generate new tokens + session
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  await createSession(user._id, newRefreshToken, req);
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    status: "success",
    message: getMessage("password_reset_success", req.lang),
    token: accessToken,
  });
});


// ======================================================================
// GET ALL ACTIVE SESSIONS
// ======================================================================

// ------------------------------------------------------
// @desc    Get all active sessions for current user
// @route   GET /api/v1/auth/sessions
// @access  Private
// ------------------------------------------------------
exports.getMySessions = asyncHandler(async (req, res, next) => {
  // Fetch all sessions for this user
  const sessions = await UserSession.find({ user: req.user._id })
    .select("-refreshTokenHash")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: sessions.length,
    data: sessions,
  });
});


// ======================================================================
// LOGOUT FROM SPECIFIC SESSION
// ======================================================================

// ------------------------------------------------------
// @desc    Logout from a specific session
// @route   DELETE /api/v1/auth/sessions/:sessionId
// @access  Private
// ------------------------------------------------------
exports.logoutFromSession = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.sessionId;

  // Ensure session belongs to current user
  const session = await UserSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });

  if (!session) {
    return next(new ApiError("Session not found", 404));
  }

  // Delete session
  await UserSession.deleteOne({ _id: sessionId });

  res.status(200).json({
    status: "success",
    message: "Session terminated successfully",
  });
});


// ======================================================================
// LOGOUT FROM ALL OTHER SESSIONS
// ======================================================================

// ------------------------------------------------------
// @desc    Logout from all sessions except current
// @route   DELETE /api/v1/auth/sessions
// @access  Private
// ------------------------------------------------------
exports.logoutFromOtherSessions = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ApiError("Not logged in", 401));
  }

  // Verify refresh token
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Fetch all sessions for this user
  const sessions = await UserSession.find({ user: payload.userId });

  let currentSession = null;

  // Identify current session by comparing hashed refresh token
  for (const session of sessions) {
    const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (match) currentSession = session;
  }

  if (!currentSession) {
    return next(new ApiError("Session not found", 404));
  }

  // Delete all sessions except the current one
  await UserSession.deleteMany({
    user: payload.userId,
    _id: { $ne: currentSession._id },
  });

  res.status(200).json({
    status: "success",
    message: "All other sessions terminated",
  });
});
