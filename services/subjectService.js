const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');
const User = require("../models/userModel");
const Year = require("../models/yearModel");
const Semester = require("../models/semesterModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private/Admin
exports.getSubjects = factory.getAll(Subject);

// @desc    Get specific subject by id
// @route   GET /api/v1/subjects/:id
// @access  Private/Admin
exports.getSubject = factory.getOne(Subject);

// @desc    Create new subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
exports.createSubject = asyncHandler(async (req, res, next) => {
  const { name, code, description, doctorId, yearId, semesterId } = req.body;

  // Check doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor) return next(new ApiError("Doctor not found", 404));
  if (doctor.role !== "doctor")
    return next(new ApiError("Assigned user is not a doctor", 400));

  // Check year exists
  const year = await Year.findById(yearId);
  if (!year) return next(new ApiError("Year not found", 404));

  // Check semester exists
  const semester = await Semester.findById(semesterId);
  if (!semester) return next(new ApiError("Semester not found", 404));

  // Create subject
  const subject = await Subject.create({
    name,
    code,
    description,
    doctorId,
    yearId,
    semesterId,
  });

  // Add subject to doctor
  await User.findByIdAndUpdate(doctorId, {
    $addToSet: { "doctorData.subjects": subject._id },
  });

  // Add subject to year
  await Year.findByIdAndUpdate(yearId, {
    $addToSet: { subjects: subject._id },
  });

  // Add subject to semester
  await Semester.findByIdAndUpdate(semesterId, {
    $addToSet: { subjects: subject._id },
  });

  res.status(201).json({
    status: "success",
    data: subject,
  });
});

// @desc    Update subject by id
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
exports.updateSubject = factory.updateOne(Subject);

// @desc    Delete subject by id
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = factory.deleteOne(Subject);
