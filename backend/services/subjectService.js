const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');
const User = require("../models/userModel");
const Year = require("../models/yearModel");
const Semester = require("../models/semesterModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const cacheService = require("../services/cacheService");
const logger = require("../utils/logger");


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

  // Log: attempt
  logger.info("Create subject attempt", {
    meta: {
      adminId: req.user._id,
      name,
      code,
      doctorId,
      yearId,
      semesterId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  // Check doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor) {
    logger.warn("Create subject failed: doctor not found", {
      meta: {
        adminId: req.user._id,
        doctorId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Doctor not found", 404));
  }

  if (doctor.role !== "doctor") {
    logger.warn("Create subject failed: assigned user is not a doctor", {
      meta: {
        adminId: req.user._id,
        doctorId,
        role: doctor.role,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Assigned user is not a doctor", 400));
  }

  // Check year exists
  const year = await Year.findById(yearId);
  if (!year) {
    logger.warn("Create subject failed: year not found", {
      meta: {
        adminId: req.user._id,
        yearId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Year not found", 404));
  }

  // Check semester exists
  const semester = await Semester.findById(semesterId);
  if (!semester) {
    logger.warn("Create subject failed: semester not found", {
      meta: {
        adminId: req.user._id,
        semesterId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Semester not found", 404));
  }

  // Create subject
  const subject = await Subject.create({
    name,
    code,
    description,
    doctorId,
    yearId,
    semesterId,
  });

  logger.info("Subject created successfully", {
    meta: {
      adminId: req.user._id,
      subjectId: subject._id,
      correlationId: req.correlationId
    }
  });

  // Add subject to doctor
  await User.findByIdAndUpdate(doctorId, {
    $addToSet: { "doctorData.subjects": subject._id },
  });

  logger.info("Subject added to doctor", {
    meta: {
      adminId: req.user._id,
      doctorId,
      subjectId: subject._id,
      correlationId: req.correlationId
    }
  });

  // Add subject to year
  await Year.findByIdAndUpdate(yearId, {
    $addToSet: { subjects: subject._id },
  });

  logger.info("Subject added to year", {
    meta: {
      adminId: req.user._id,
      yearId,
      subjectId: subject._id,
      correlationId: req.correlationId
    }
  });

  // Add subject to semester
  await Semester.findByIdAndUpdate(semesterId, {
    $addToSet: { subjects: subject._id },
  });

  logger.info("Subject added to semester", {
    meta: {
      adminId: req.user._id,
      semesterId,
      subjectId: subject._id,
      correlationId: req.correlationId
    }
  });

  // Cache invalidation
  await cacheService.del("subjects:all");

  logger.info("Cache invalidated: subjects:all", {
    meta: {
      adminId: req.user._id,
      correlationId: req.correlationId
    }
  });

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
exports.updateSubject = asyncHandler(async (req, res, next) => {
  const subjectId = req.params.id;

  // Log: update attempt
  logger.info("Update subject attempt", {
    meta: {
      adminId: req.user._id,
      subjectId,
      body: req.body,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  const handler = factory.updateOne(Subject);

  await handler(req, res, async () => {
    // Cache invalidation
    await cacheService.del("subjects:all");
    await cacheService.del(`subject:${subjectId}`);

    logger.info("Subject updated successfully", {
      meta: {
        adminId: req.user._id,
        subjectId,
        correlationId: req.correlationId
      }
    });

    next();
  });
});



// ======================================================================
// DELETE SUBJECT
// ======================================================================
// @desc    Delete subject by id
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
// ======================================================================
exports.deleteSubject = asyncHandler(async (req, res, next) => {
  const subjectId = req.params.id;

  // Log: delete attempt
  logger.info("Delete subject attempt", {
    meta: {
      adminId: req.user._id,
      subjectId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  // 1) Find subject
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    logger.warn("Delete subject failed: subject not found", {
      meta: {
        adminId: req.user._id,
        subjectId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Subject not found", 404));
  }

  // 2) Remove subject from its Year
  await Year.updateOne(
    { _id: subject.yearId },
    { $pull: { subjects: subjectId } }
  );

  logger.info("Subject removed from year", {
    meta: {
      adminId: req.user._id,
      subjectId,
      yearId: subject.yearId,
      correlationId: req.correlationId
    }
  });

  // 3) Remove subject from its Semester
  await Semester.updateOne(
    { _id: subject.semesterId },
    { $pull: { subjects: subjectId } }
  );

  logger.info("Subject removed from semester", {
    meta: {
      adminId: req.user._id,
      subjectId,
      semesterId: subject.semesterId,
      correlationId: req.correlationId
    }
  });

  // 4) Delete subject
  await Subject.findByIdAndDelete(subjectId);

  logger.info("Subject deleted from database", {
    meta: {
      adminId: req.user._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

  // 5) Cache invalidation
  await cacheService.del("subjects:all");
  await cacheService.del(`subject:${subjectId}`);

  logger.info("Cache invalidated for subject", {
    meta: {
      adminId: req.user._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

  // 6) Response
  logger.info("Delete subject successful", {
    meta: {
      adminId: req.user._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

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
  console.log("🔥 ENTERED getMySubjects");

  console.log("req.user =", req.user);
  console.log("req.user.studentData =", req.user.studentData);
  console.log("req.user.studentData.year =", req.user.studentData?.year);

  const user = await User.findById(req.user._id).populate("studentData.year");
  console.log("🔥 user from DB =", user);
  console.log("🔥 user.studentData =", user.studentData);
  console.log("🔥 user.studentData.year =", user.studentData?.year);

  const studentYearId = user.studentData?.year?._id;
  console.log("🔥 studentYearId =", studentYearId);

  const subjects = await Subject.find({ yearId: studentYearId });
  console.log("🔥 subjects.length =", subjects.length);
  console.log("🔥 subjects =", subjects);

  res.status(200).json({
    status: "success",
    results: subjects.length,
    data: subjects,
  });
});
