const express = require("express");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userService");

const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

// ------------------------------------------------------
// Logged User Routes
// ------------------------------------------------------

// @desc    Get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private (student/doctor/admin)
router.get("/getMe", protect, getLoggedUserData, getUser);

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private (student/doctor/admin)
router.put("/changeMyPassword", protect, updateLoggedUserPassword);

// @desc    Update logged user data
// @route   PUT /api/v1/users/updateMe
// @access  Private (student/doctor)
router.put(
  "/updateMe",
  protect,
  allowedTo("student", "doctor"),
  updateLoggedUserValidator,
  updateLoggedUserData
);



// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private (student/doctor/admin)
router.delete("/deleteMe", protect, deleteLoggedUserData);

// ------------------------------------------------------
// Admin Routes
// ------------------------------------------------------

router
  .route("/")
  // @desc    Get all users
  // @route   GET /api/v1/users
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getUsers)

  // @desc    Create new user
  // @route   POST /api/v1/users
  // @access  Private/Admin
  .post(
    protect,
    allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  );

router
  .route("/:id")
  // @desc    Get user by id
  // @route   GET /api/v1/users/:id
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getUserValidator, getUser)

  // @desc    Update user by id
  // @route   PUT /api/v1/users/:id
  // @access  Private/Admin
  .put(
    protect,
    allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )

  // @desc    Delete user by id
  // @route   DELETE /api/v1/users/:id
  // @access  Private/Admin
  .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser);

module.exports = router;
