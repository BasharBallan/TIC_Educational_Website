const express = require("express");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
  createDoctorValidator,
  getDoctorValidator,
  updateDoctorValidator,
  deleteDoctorValidator,
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
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../services/userService");

const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

// ------------------------------------------------------
// Logged User Routes
// ------------------------------------------------------

// @desc    Get logged user data
// @route   GET /api/v1/users/getMe
router.get("/getMe", protect, getLoggedUserData, getUser);

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
router.put("/updateMyPassword", protect, updateLoggedUserPassword);

// @desc    Update logged user data
// @route   PUT /api/v1/users/updateMe
router.put(
  "/updateMe",
  protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
router.delete("/deleteMe", protect, deleteLoggedUserData);

// ------------------------------------------------------
// Admin Routes (Users CRUD)
// ------------------------------------------------------

router
  .route("/")
  .get(protect, allowedTo("admin"), getUsers)
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
  .get(protect, allowedTo("admin"), getUserValidator, getUser)
  .put(
    protect,
    allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(protect, allowedTo("admin"), deleteUserValidator, deleteUser);

// ------------------------------------------------------
// Admin Routes (Doctors CRUD)
// ------------------------------------------------------

// @desc    Add new doctor
// @route   POST /api/v1/users/admin/doctors
router.post(
  "/admin/doctors",
  protect,
  allowedTo("admin"),
  createDoctorValidator,
  addDoctor
);

// @desc    Get all doctors
// @route   GET /api/v1/users/admin/doctors
router.get(
  "/admin/doctors",
  protect,
  allowedTo("admin"),
  getDoctors
);

// @desc    Get doctor by ID
// @route   GET /api/v1/users/admin/doctors/:id
router.get(
  "/admin/doctors/:id",
  protect,
  allowedTo("admin"),
  getDoctorValidator,
  getDoctor
);

// @desc    Update doctor
// @route   PUT /api/v1/users/admin/doctors/:id
router.put(
  "/admin/doctors/:id",
  protect,
  allowedTo("admin"),
  updateDoctorValidator,
  updateDoctor
);

// @desc    Delete doctor
// @route   DELETE /api/v1/users/admin/doctors/:id
router.delete(
  "/admin/doctors/:id",
  protect,
  allowedTo("admin"),
  deleteDoctorValidator,
  deleteDoctor
);

module.exports = router;
