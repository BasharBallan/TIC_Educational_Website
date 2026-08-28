const asyncHandler = require("express-async-handler");

const Lecture = require('../models/lectureModel');
const factory = require('./handlersFactory');
const cacheService = require("./cacheService");
const ApiError = require("../utils/apiError");
const Subject = require("../models/subjectModel");
const logger = require("../utils/logger");


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
// DELETE LECTURE (ADMIN)
// ======================================================================
// @desc    Delete lecture by id
// @route   DELETE /api/v1/lectures/:id
// @access  Private/Admin
// ======================================================================
exports.deleteLecture = asyncHandler(async (req, res, next) => {
  const lectureId = req.params.id;

  // Log: delete attempt
  logger.info("Admin delete lecture attempt", {
    meta: {
      adminId: req.user._id,
      lectureId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  // 1) Find lecture
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    logger.warn("Admin delete lecture failed: lecture not found", {
      meta: {
        adminId: req.user._id,
        lectureId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Lecture not found", 404));
  }

  // 2) Remove lecture reference from subject
  await Subject.updateOne(
    { _id: lecture.subjectId },
    { $pull: { lectures: lecture._id } }
  );

  logger.info("Lecture removed from subject", {
    meta: {
      adminId: req.user._id,
      lectureId,
      subjectId: lecture.subjectId,
      correlationId: req.correlationId
    }
  });

  // 3) Delete lecture
  await Lecture.findByIdAndDelete(lectureId);

  logger.info("Lecture deleted from database", {
    meta: {
      adminId: req.user._id,
      lectureId,
      correlationId: req.correlationId
    }
  });

  // 4) Cache invalidation
  await cacheService.del(`lecture:${lectureId}`);
  await cacheService.del("lectures:all");

  logger.info("Cache invalidated for lecture", {
    meta: {
      adminId: req.user._id,
      lectureId,
      correlationId: req.correlationId
    }
  });

  // 5) Response
  logger.info("Admin delete lecture successful", {
    meta: {
      adminId: req.user._id,
      lectureId,
      correlationId: req.correlationId
    }
  });

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

  // Log: attempt
  logger.info("Fetching lectures for student", {
    meta: {
      userId: req.user._id,
      studentYear: req.user.yearId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  const studentYearId = req.user.studentData.year;

  if (!studentYearId) {
    logger.warn("Fetching lectures failed: student year not found", {
      meta: {
        userId: req.user._id,
        correlationId: req.correlationId
      }
    });

    return next(new ApiError("Student year not found", 400));
  }

  const subjects = await Subject.find({ yearId: studentYearId }).select("_id");

  if (!subjects.length) {
    logger.info("No subjects found for student year", {
      meta: {
        userId: req.user._id,
        studentYear: studentYearId,
        correlationId: req.correlationId
      }
    });

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

  // Log: success
  logger.info("Lectures fetched successfully", {
    meta: {
      userId: req.user._id,
      studentYear: studentYearId,
      subjectsCount: subjects.length,
      lecturesCount: lectures.length,
      correlationId: req.correlationId
    }
  });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: lectures,
  });
});

// ======================================================================
// GET LECTURES BY SUBJECTS
// ======================================================================
// @desc    Get  lectures by subjects
// @route   GET /api/v1/lectures/subject/subjectId
// @access  Private/Student
// ======================================================================
exports.getLecturesBySubject = asyncHandler(async (req, res, next) => {
  const { subjectId } = req.params;

  const subject = await Subject.findById(subjectId).populate("lectures");

  if (!subject) {
    return next(new ApiError("Subject not found", 404));
  }

  const lectures = subject.lectures;

  res.status(200).json({
    status: "success",
    subject: {
      _id: subject._id,
      name: subject.name,
    },
    results: lectures.length,
    data: lectures,
  });
});
