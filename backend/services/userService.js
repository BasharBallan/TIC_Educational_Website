const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const createToken = require('../utils/createToken');
const User = require('../models/userModel');
const logger = require("../utils/logger");


// ======================================================================
// UPLOAD USER IMAGE
// ======================================================================
// @desc    Upload single user image
// @route   N/A (middleware)
// @access  Private
// ======================================================================
exports.uploadUserImage = uploadSingleImage('profileImg');


// ======================================================================
// RESIZE USER IMAGE
// ======================================================================
// @desc    Resize uploaded user image
// @route   N/A (middleware)
// @access  Private
// ======================================================================
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

      console.log("FILE:", req.file);
console.log("BODY:", req.body);

    req.body.profileImg = filename;
  }

  next();
});


// ======================================================================
// GET ALL USERS
// ======================================================================
// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
// ======================================================================
exports.getUsers = factory.getAll(User);


// ======================================================================
// GET USER BY ID
// ======================================================================
// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
// ======================================================================
exports.getUser = factory.getOne(User);


// ======================================================================
// DELETE USER
// ======================================================================
// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
// ======================================================================
exports.deleteUser = factory.deleteOne(User);


// ======================================================================
// GET LOGGED USER DATA
// ======================================================================
// @desc    Get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
// ======================================================================
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate("studentData.year", "name")
    .populate("studentData.semester", "name")
    .populate("studentData.subjects", "name")
    .populate("doctorData.subjects", "name");

  if (!user) {
    return res.status(404).json({ status: "fail", message: "User not found" });
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});



// ======================================================================
// UPDATE LOGGED USER PASSWORD
// ======================================================================
// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
// ======================================================================
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const isCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isCorrect) {
    return next(new ApiError("Incorrect current password", 400));
  }

  if (req.body.newPassword === req.body.currentPassword) {
    return next(
      new ApiError("New password must be different from current password", 400)
    );
  }

  user.passwordConfirm = req.body.passwordConfirm;

  if (req.body.newPassword !== req.body.passwordConfirm) {
    return next(new ApiError("Password confirmation does not match", 400));
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({ token });
});


// ======================================================================
// UPDATE LOGGED USER DATA
// ======================================================================
// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
// ======================================================================
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg

    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});


// ======================================================================
// DEACTIVATE LOGGED USER
// ======================================================================
// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
// ======================================================================
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Success' });
});


// ======================================================================
// ADD NEW DOCTOR
// ======================================================================
// @desc    Add new doctor
// @route   POST /api/v1/admin/doctors
// @access  Private/Admin
// ======================================================================
exports.addDoctor = asyncHandler(async (req, res, next) => {
  const { name, email, password, specialization, academicTitle } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(getMessage("email_already_used", req.lang), 400));
  }

  const doctor = await User.create({
    name,
    email,
    password,
    role: "doctor",
    doctorData: {
      specialization,
      academicTitle,
    },
  });

  doctor.password = undefined;

  res.status(201).json({
    status: "success",
    data: doctor,
  });
});


// ======================================================================
// GET ALL DOCTORS
// ======================================================================
// @desc    Get all doctors
// @route   GET /api/v1/admin/doctors
// @access  Private/Admin
// ======================================================================
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await User.find({ role: "doctor" });

  res.status(200).json({
    status: "success",
    results: doctors.length,
    data: doctors,
  });
});


// ======================================================================
// GET DOCTOR BY ID
// ======================================================================
// @desc    Get doctor by id
// @route   GET /api/v1/admin/doctors/:id
// @access  Private/Admin
// ======================================================================
exports.getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });

  if (!doctor) {
    return next(new ApiError(getMessage("doctor_not_found", req.lang), 404));
  }

  res.status(200).json({
    status: "success",
    data: doctor,
  });
});


// ======================================================================
// UPDATE DOCTOR
// ======================================================================
// @desc    Update doctor
// @route   PUT /api/v1/admin/doctors/:id
// @access  Private/Admin
// ======================================================================
exports.updateDoctor = asyncHandler(async (req, res, next) => {
  const { email, password, ...allowedUpdates } = req.body;

  if (req.body.specialization) {
    allowedUpdates["doctorData.specialization"] = req.body.specialization;
  }

  if (req.body.academicTitle) {
    allowedUpdates["doctorData.academicTitle"] = req.body.academicTitle;
  }

  const doctor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "doctor" },
    allowedUpdates,
    { new: true }
  );

  if (!doctor) {
    return next(new ApiError(getMessage("doctor_not_found", req.lang), 404));
  }

  res.status(200).json({
    status: "success",
    data: doctor,
  });
});


// ======================================================================
// DELETE DOCTOR
// ======================================================================
// @desc    Delete doctor
// @route   DELETE /api/v1/admin/doctors/:id
// @access  Private/Admin
// ======================================================================
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await User.findOneAndDelete({ _id: req.params.id, role: "doctor" });

  if (!doctor) {
    return next(new ApiError(getMessage("doctor_not_found", req.lang), 404));
  }

  res.status(200).json({
    status: "success",
  });
});

// ======================================================================
// COMPLETE PROFILE (STUDENT / DOCTOR)
// ======================================================================
// @desc    Complete logged user profile based on role
// @route   PUT /api/v1/users/complete-profile
// @access  Private/Protect
// ======================================================================
exports.completeProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Base fields for all users
  const updateData = {
    phone: req.body.phone,
  };

  // Handle profile image (multer)
  if (req.file) {
    updateData.profileImg = req.file.filename;
  }

  // ======================================================================
  // STUDENT PROFILE COMPLETION
  // ======================================================================
  if (req.user.role === "student") {
    updateData.studentData = {
      studentNumber: req.body.studentNumber,
      year: req.body.year,
      semester: req.body.semester,
    };
  }

  // ======================================================================
  // DOCTOR PROFILE COMPLETION
  // ======================================================================
  if (req.user.role === "doctor") {
    updateData.doctorData = {
      specialization: req.body.specialization,
      academicTitle: req.body.academicTitle,
      subjects: req.body.subjects, // array of subject IDs
    };
  }

  // ======================================================================
  // UPDATE USER
  // ======================================================================
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  })
    .populate("studentData.year")
    .populate("studentData.semester")
    .populate("studentData.subjects")
    .populate("doctorData.subjects");

  res.status(200).json({
    status: "success",
    message: "Profile completed successfully",
    data: updatedUser,
  });
});
