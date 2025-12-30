const mongoose = require('mongoose');

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const getMessage = require("../utils/getMessage");

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public

exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, studentNumber, year, semester } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(getMessage("email_already_used", req.lang), 400));
  }

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

  const token = createToken(student._id);
  student.password = undefined;

  res.status(201).json({
    status: "success",
    message: getMessage("signup_success", req.lang),
    data: student,
    token,
  });
});


// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError(getMessage("invalid_credentials", req.lang), 401));
  }

  if (!user.active) {
    return next(new ApiError(getMessage("account_inactive", req.lang), 403));
  }

  const token = createToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: "success",
    message: getMessage("login_success", req.lang),
    data: user,
    token,
  });
});


// @desc    Admin Signup
// @route   POST /api/v1/auth/adminSignup
// @access  Public (لكن عمليًا تستعملها مرة لتوليد admin)
exports.AdminSignup = asyncHandler(async (req, res, next) => {


  const adminUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: "admin", 
  });

  const token = createToken(adminUser._id);

  res.status(201).json({
    status: "success",
    message: getMessage("admin_signup_success", req.lang),
    data: adminUser,
    token,
  });
});

// @desc    Admin Login
// @route   POST /api/v1/auth/adminLogin
// @access  Public
exports.Adminlogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: getMessage("admin_login_missing_fields", req.lang),
    });
  }

  const admin = await User.findOne({ email }).select("+password");

  if (!admin) {
    return res.status(401).json({
      status: "fail",
      message: getMessage("admin_not_found", req.lang),
    });
  }

  if (admin.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: getMessage("admin_role_invalid", req.lang),
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({
      status: "fail",
      message: getMessage("admin_invalid_password", req.lang),
    });
  }

  const token = createToken(admin._id);

  res.status(200).json({
    status: "success",
    message: getMessage("admin_login_success", req.lang),
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
  });
});

// @desc   Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError(getMessage("not_logged_in", req.lang), 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError(getMessage("user_not_exist", req.lang), 401));
  }

  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError(getMessage("password_changed", req.lang), 401));
    }
  }

  req.user = currentUser;
  next();
});

// @desc    Authorization
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(getMessage("unauthorized", req.lang), 403));
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(getMessage("no_user_with_email", req.lang), 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto.createHash("sha256").update(resetCode).digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  const message = `Hi ${user.name},\nYour reset code is: ${resetCode}\nValid for 10 minutes.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
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

// @desc    Verify reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto.createHash("sha256").update(req.body.resetCode).digest("hex");

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

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(getMessage("no_user_with_email", req.lang), 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError(getMessage("reset_code_not_verified", req.lang), 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    message: getMessage("password_reset_success", req.lang),
    token,
  });
});
