const Lecture = require('../models/lectureModel');
const factory = require('./handlersFactory');
const cacheService = require("../services/cacheService");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Subject = require("../models/subjectModel");


// ======================================================================
// GET ALL LECTURES
// ======================================================================
// @desc    Get all lectures
// @route   GET /api/v1/lectures
// @access  Private/Admin
// ======================================================================
exports.getLectures = factory.getAll(Lecture);


// ======================================================================
// GET LECTURE BY ID
// ======================================================================
// @desc    Get specific lecture by id
// @route   GET /api/v1/lectures/:id
// @access  Private/Admin
// ======================================================================
exports.getLecture = factory.getOne(Lecture);


// ======================================================================
// DELETE LECTURE
// ======================================================================
// @desc    Delete lecture by id
// @route   DELETE /api/v1/lectures/:id
// @access  Private/Admin
// ======================================================================
exports.deleteLecture = asyncHandler(async (req, res, next) => {
  const lectureId = req.params.id;

  // 1) Find lecture
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    return next(new ApiError("Lecture not found", 404));
  }

  // 2) Remove lecture reference from subject
  await Subject.updateOne(
    { _id: lecture.subjectId },
    { $pull: { lectures: lecture._id } }
  );

  // 3) Delete lecture
  await Lecture.findByIdAndDelete(lectureId);

  // 4) Cache invalidation
  await cacheService.del(`lecture:${lectureId}`);
  await cacheService.del("lectures:all");

  res.status(200).json({
    status: "success",
    message: "Lecture deleted successfully",
  });
});


// ======================================================================
// GET MY LECTURES
// ======================================================================
// @desc    Get all lectures for the logged-in student (based on yearId)
// @route   GET /api/v1/lectures/my-lectures
// @access  Private/Student
// ======================================================================
exports.getMyLectures = asyncHandler(async (req, res, next) => {
  const studentYearId = req.user.yearId;
  if (!studentYearId) {
    return next(new ApiError("Student year not found", 400));
  }

  const subjects = await Subject.find({ yearId: studentYearId }).select("_id");

  if (!subjects.length) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: [],
    });
  }

  const subjectIds = subjects.map((s) => s._id);

  const lectures = await Lecture.find({ subjectId: { $in: subjectIds } })
    .populate("subject", "name yearId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: lectures,
  });
});
