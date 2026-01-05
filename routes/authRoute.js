const express = require("express");

const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  AdminSignup,
  Adminlogin,
} = require("../services/authService");

const router = express.Router();

// ---------------------- Auth Routes ----------------------

// @desc    Student Signup
// @route   POST /api/v1/auth/signup
// @access  Public
router.post("/signup", signupValidator, signup);

// @desc    Student Login
// @route   POST /api/v1/auth/login
// @access  Public
router.post("/login", loginValidator, login);

// @desc    Admin Login
// @route   POST /api/v1/auth/adminLogin
// @access  Public
router.post("/adminLogin", Adminlogin);

// @desc    Admin Signup (one-time use)
// @route   POST /api/v1/auth/adminSignup
// @access  Public (but used once)
router.post("/adminSignup", AdminSignup);

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
router.post("/forgotPassword", forgotPassword);

// @desc    Verify Reset Code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
router.post("/verifyResetCode", verifyPassResetCode);

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetPassword
// @access  Public
router.put("/resetPassword", resetPassword);

module.exports = router;
