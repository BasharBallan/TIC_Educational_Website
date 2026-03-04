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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization APIs
 */

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
 *               - passwordConfirm
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
 *               passwordConfirm:
 *                 type: string
 *                 example: "Pass123@456"
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Invalid input data
 */

router.post("/signup", signupValidator, signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Student Login
 *     tags: [Auth]
 *     description: Login using email and password. Use the example credentials below for testing.
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

router.post("/adminLogin", Adminlogin);

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

router.post("/adminSignup", AdminSignup);

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
router.post("/forgotPassword", forgotPassword);

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

module.exports = router;
