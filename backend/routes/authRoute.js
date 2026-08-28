const express = require("express");
const router = express.Router();

const {
  signupValidator,
  loginValidator,
  adminLoginValidator,
  adminSignupValidator,
  forgotPasswordValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  AdminSignup,
  Adminlogin,
  refreshToken,
  logout,
  protect,
  getMySessions,
  logoutFromSession,
  logoutFromOtherSessions,
  googleCallbackService,
  googleUnlinkService,
  googleInitService,
  setPasswordService,
  verifyEmail,
  completeProfile,
  rejectUser,
  approveUser,
  resendVerificationCode,
  uploadSignupImages,
  resizeSignupImages,
} = require("../services/authService");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization APIs
 */

/* =====================================================================
   STUDENT SIGNUP
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Student Signup
 *     tags: [Auth]
 *     description: Register a new student account. Use the example below for testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - comfirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: "scsduichsm,"
 *               email:
 *                 type: string
 *                 example: "basharbalcklsnan9@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Pass123@456"
 *               confirmPassword:
 *                 type: string
 *                 example: "Pass123@456"
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/signup", signupValidator, signup);
/* =====================================================================
   VERIFY EMAIL (SIGNUP STEP 2)
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify Email Code
 *     tags: [Auth]
 *     description: Verify the 6-digit code sent to the user's email during signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: "bashar@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 */
router.post("/verify-email", verifyEmail);
/* =====================================================================
   COMPLETE PROFILE (SIGNUP STEP 3)
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/complete-profile:
 *   post:
 *     summary: Complete Student Profile
 *     tags: [Auth]
 *     description: Complete the student's profile after email verification. Includes phone, year, semester, and required images.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - year
 *               - profileImg
 *               - universityCardImg
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@example.com"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               year:
 *                 type: string
 *                 example: "66f7b9d2c1a2f8a9b3c12345"
 *               semester:
 *                 type: string
 *                 example: "66f7b9d2c1a2f8a9b3c67890"
 *               profileImg:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               universityCardImg:
 *                 type: string
 *                 example: "https://example.com/card.jpg"
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Invalid input data
 */
 router.post(
   "/complete-profile",
   uploadSignupImages,
   resizeSignupImages,
   completeProfile
 );

/* =====================================================================
   ADMIN APPROVAL
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/admin/approve-user/{id}:
 *   post:
 *     summary: Approve a student account
 *     tags: [Auth]
 *     description: Approve a student's profile after verification and profile completion.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User approved successfully
 *       404:
 *         description: User not found
 */
router.post("/admin/approve-user/:id", protect, approveUser);

/**
 * @swagger
 * /api/v1/auth/admin/reject-user/{id}:
 *   post:
 *     summary: Reject a student account
 *     tags: [Auth]
 *     description: Reject a student's profile with an optional reason.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Invalid university card"
 *     responses:
 *       200:
 *         description: User rejected successfully
 *       404:
 *         description: User not found
 */
router.post("/admin/reject-user/:id", protect, rejectUser);

/* =====================================================================
   LOGIN (STUDENT / DOCTOR) — Updated to match new authService logic
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Student Login
 *     tags: [Auth]
 *     description: Login using email and password. Includes device detection, session creation, and refresh token rotation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "doctordndsjvnssnaskcnakl30@example.com"
 *               password:
 *                 type: string
 *                 example: "Doctor12@345"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidator, login);

/* =====================================================================
   ADMIN LOGIN
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/adminLogin:
 *   post:
 *     summary: Admin Login
 *     tags: [Auth]
 *     description: Login for admin users only. Use the example credentials below for testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "sosoad@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Bashar1234@"
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid admin credentials
 */
router.post("/adminLogin", adminLoginValidator, Adminlogin);

/* =====================================================================
   ADMIN SIGNUP
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/adminSignup:
 *   post:
 *     summary: Admin Signup (one-time use)
 *     tags: [Auth]
 *     description: Create a new admin account. Use the example below for testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bascchar125"
 *               email:
 *                 type: string
 *                 example: "sosocdscad@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Bashar1234@"
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/adminSignup", adminSignupValidator, AdminSignup);

/* =====================================================================
   FORGOT PASSWORD
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/forgotPassword:
 *   post:
 *     summary: Forgot Password
 *     tags: [Auth]
 *     description: Send a reset code to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "basharballan9@gmail.com"
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *       404:
 *         description: Email not found
 */
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);

/* =====================================================================
   VERIFY RESET CODE
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/verifyResetCode:
 *   post:
 *     summary: Verify Reset Code
 *     tags: [Auth]
 *     description: Verify the password reset code sent to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetCode
 *             properties:
 *               resetCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *       400:
 *         description: Invalid or expired reset code
 */
router.post("/verifyResetCode", verifyPassResetCode);

/* =====================================================================
   RESET PASSWORD
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/resetPassword:
 *   put:
 *     summary: Reset Password
 *     tags: [Auth]
 *     description: Reset the user's password after verifying the reset code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: "basharbalan9@gmail.com"
 *               newPassword:
 *                 type: string
 *                 example: "newStrongPassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request data
 */
router.put("/resetPassword", resetPassword);

/* =====================================================================
   REFRESH TOKEN
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     description: Generate a new access token using a valid refresh token. Implements refresh token rotation and session validation.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refreshToken);

/* =====================================================================
   LOGOUT
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     description: Logout the user and invalidate all active sessions. Clears refresh token cookie.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/* =====================================================================
   SESSION MANAGEMENT (NEW)
   ===================================================================== */

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Auth]
 *     description: Returns all active login sessions for the authenticated user.
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/sessions", protect, getMySessions);

/**
 * @swagger
 * /api/v1/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Logout from a specific session
 *     tags: [Auth]
 *     description: Terminates a specific session by its ID.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to terminate
 *     responses:
 *       200:
 *         description: Session terminated successfully
 *       404:
 *         description: Session not found
 */
router.delete("/sessions/:sessionId", protect, logoutFromSession);

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   delete:
 *     summary: Logout from all other sessions
 *     tags: [Auth]
 *     description: Terminates all sessions except the current one (based on refresh token).
 *     responses:
 *       200:
 *         description: All other sessions terminated
 *       401:
 *         description: Unauthorized
 */
router.delete("/sessions", protect, logoutFromOtherSessions);

/**
 * @swagger
 * /api/v1/auth/google/init:
 *   get:
 *     summary: Initialize Google OAuth (PKCE + State)
 *     tags: [Auth]
 *     description: Generates PKCE parameters (code_verifier, code_challenge) and a secure state token, stores them temporarily, and returns a Google OAuth URL for redirection.
 *     responses:
 *       200:
 *         description: Google OAuth URL generated successfully
 */
router.get("/google/init", googleInitService);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback (PKCE Verification)
 *     tags: [Auth]
 *     description: Handles Google OAuth callback, verifies PKCE + state, exchanges authorization code for tokens, and logs the user in.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code returned from Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State token returned from Google
 *     responses:
 *       302:
 *         description: Redirects to frontend with access token
 *       400:
 *         description: Invalid or expired OAuth parameters
 */
router.get("/google/callback", googleCallbackService);

/**
 * @swagger
 * /api/v1/auth/unlink/google:
 *   delete:
 *     summary: Unlink Google Account
 *     tags: [Auth]
 *     description: Disconnects Google login from the authenticated user. Requires that the user has manually set a password.
 *     responses:
 *       200:
 *         description: Google account unlinked successfully
 *       400:
 *         description: Google not linked or password not manually set
 *       401:
 *         description: Unauthorized
 */
router.delete("/unlink/google", protect, googleUnlinkService);

/* =====================================================================
   SET PASSWORD (GOOGLE USERS)
   ===================================================================== */
/**
 * @swagger
 * /api/v1/auth/set-password:
 *   post:
 *     summary: Set password for Google-authenticated users
 *     tags: [Auth]
 *     description: Allows users who signed up with Google to manually set a password before unlinking Google.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "Pass123@456"
 *     responses:
 *       200:
 *         description: Password set successfully
 *       400:
 *         description: Invalid password or user already has a password
 *       401:
 *         description: Unauthorized
 */
router.post("/set-password", protect, setPasswordService);
router.post("/resend-code", resendVerificationCode);

module.exports = router;
