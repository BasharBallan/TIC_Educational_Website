const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');
const User = require("../models/userModel");
const Year = require("../models/yearModel");
const Semester = require("../models/semesterModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const cacheService = require("../services/cacheService");


// ======================================================================
// GET ALL SUBJECTS
// ======================================================================
// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private/Admin
// ======================================================================
exports.getSubjects = factory.getAll(Subject);


// ======================================================================
// GET SPECIFIC SUBJECT
// ======================================================================
// @desc    Get specific subject by id
// @route   GET /api/v1/subjects/:id
// @access  Private/Admin
// ======================================================================
exports.getSubject = factory.getOne(Subject);


// ======================================================================
// CREATE SUBJECT
// ======================================================================
// @desc    Create new subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
// ======================================================================
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

  // Cache invalidation
  await cacheService.del("subjects:all");

  res.status(201).json({
    status: "success",
    data: subject,
  });
});


// ======================================================================
// UPDATE SUBJECT
// ======================================================================
// @desc    Update subject by id
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
// ======================================================================
exports.updateSubject = async (req, res, next) => {
  const handler = factory.updateOne(Subject);

  await handler(req, res, async () => {
    await cacheService.del("subjects:all");
    await cacheService.del(`subject:${req.params.id}`);
    next();
  });
};


// ======================================================================
// DELETE SUBJECT
// ======================================================================
// @desc    Delete subject by id
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
// ======================================================================
exports.deleteSubject = asyncHandler(async (req, res, next) => {
  const subjectId = req.params.id;

  // 1) Find subject
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return next(new ApiError("Subject not found", 404));
  }

  // 2) Remove subject from its Year
  await Year.updateOne(
    { _id: subject.yearId },
    { $pull: { subjects: subjectId } }
  );

  // 3) Remove subject from its Semester
  await Semester.updateOne(
    { _id: subject.semesterId },
    { $pull: { subjects: subjectId } }
  );

  // 4) Delete subject
  await Subject.findByIdAndDelete(subjectId);

  // 5) Cache invalidation
  await cacheService.del("subjects:all");
  await cacheService.del(`subject:${subjectId}`);

  // 6) Response
  res.status(200).json({
    status: "success",
    message: "Subject deleted successfully",
  });
});


// ======================================================================
// GET SUBJECTS FOR STUDENT YEAR
// ======================================================================
// @desc    Get all subjects that belong to the student's academic year
// @route   GET /api/v1/subjects/my-subjects
// @access  Private/Student
// ======================================================================
exports.getMySubjects = asyncHandler(async (req, res, next) => {


  const studentYearId = req.user.studentData?.year;

  if (!studentYearId) {
    return next(new ApiError("Student year not found", 400));
  }


  const subjects = await Subject.find({ yearId: studentYearId })
    .select("name yearId");


  res.status(200).json({
    status: "success",
    results: subjects.length,
    data: subjects,
  });
});

