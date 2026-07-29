const asyncHandler = require("express-async-handler");
const Lecture = require("../models/lectureModel");
const User = require("../models/userModel");
const Subject = require("../models/subjectModel");
const ApiError = require("../utils/apiError");
const cacheService = require("../services/cacheService");
const logger = require("../utils/logger");

// ======================================================================
// HELPER: Check if doctor teaches a specific subject
// ======================================================================
const doctorTeachesSubject = (doctor, subjectId) => {
  return doctor.doctorData.subjects.some(
    (sub) => sub.toString() === subjectId.toString()
  );
};

// ======================================================================
// GET ALL LECTURES FOR THIS DOCTOR
// ======================================================================
// @desc    Get all lectures created by this doctor
// @route   GET /api/v1/doctor/lectures
// @access  Private/Doctor
// ======================================================================
exports.getMyLectures = asyncHandler(async (req, res, next) => {
  const lectures = await Lecture.find({ doctorId: req.user._id });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: lectures,
  });
});

// ======================================================================
// GET SPECIFIC LECTURE FOR THIS DOCTOR
// ======================================================================
// @desc    Get a specific lecture created by this doctor
// @route   GET /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ======================================================================
exports.getMyLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findOne({
    _id: req.params.id,
    doctorId: req.user._id,
  });

  if (!lecture) {
    return next(new ApiError("Lecture not found or not yours", 404));
  }

  res.status(200).json({
    status: "success",
    data: lecture,
  });
});

// ======================================================================
// CREATE NEW LECTURE
// ======================================================================
// @desc    Create a new lecture
// @route   POST /api/v1/doctor/lectures
// @access  Private/Doctor
// ======================================================================
exports.createMyLecture = asyncHandler(async (req, res, next) => {
  const { title, description, subjectId } = req.body;

  // Log: attempt
  logger.info("Create lecture attempt", {
    meta: {
      doctorId: req.user._id,
      subjectId,
      title,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  // 1) Ensure subject exists
  const subjectDoc = await Subject.findById(subjectId);
  if (!subjectDoc) {
    logger.warn("Create lecture failed: subject not found", {
      meta: {
        doctorId: req.user._id,
        subjectId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("Subject not found", 404));
  }

  // 2) Ensure doctor teaches this subject
  if (!doctorTeachesSubject(req.user, subjectId)) {
    logger.warn("Create lecture failed: doctor not assigned to subject", {
      meta: {
        doctorId: req.user._id,
        subjectId,
        correlationId: req.correlationId
      }
    });
    return next(new ApiError("You are not assigned to this subject", 403));
  }

  // 3) Handle file upload (optional)
  let fileData = null;
  if (req.file) {
    fileData = {
      url: `/uploads/lectures/${req.file.filename}`,
      type: req.file.mimetype,
    };

    logger.info("Lecture file uploaded", {
      meta: {
        doctorId: req.user._id,
        fileName: req.file.filename,
        fileType: req.file.mimetype,
        correlationId: req.correlationId
      }
    });
  }

  // 4) Create lecture
  const lecture = await Lecture.create({
    title,
    description,
    subjectId,
    doctorId: req.user._id,
    file: fileData,
  });

  logger.info("Lecture created successfully", {
    meta: {
      doctorId: req.user._id,
      lectureId: lecture._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

  // 5) Add lecture to subject
  await Subject.findByIdAndUpdate(subjectId, {
    $push: { lectures: lecture._id },
  });

  logger.info("Lecture added to subject", {
    meta: {
      doctorId: req.user._id,
      lectureId: lecture._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

  // 6) Add lecture to doctor
  await User.findByIdAndUpdate(req.user._id, {
    $push: { "doctorData.lectures": lecture._id },
  });

  logger.info("Lecture added to doctor", {
    meta: {
      doctorId: req.user._id,
      lectureId: lecture._id,
      correlationId: req.correlationId
    }
  });

  // 7) Cache invalidation
  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${subjectId}`);

  logger.info("Cache invalidated for lecture lists", {
    meta: {
      doctorId: req.user._id,
      subjectId,
      correlationId: req.correlationId
    }
  });

  res.status(201).json({
    status: "success",
    data: lecture,
  });
});

// ======================================================================
// UPDATE LECTURE
// ======================================================================
// @desc    Update lecture
// @route   PUT /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ======================================================================
exports.updateMyLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findOne({
    _id: req.params.id,
    doctorId: req.user._id,
  });

  if (!lecture) {
    return next(new ApiError("Lecture not found or not yours", 404));
  }

  // If subject is being changed → validate again
  if (req.body.subjectId) {
    if (!doctorTeachesSubject(req.user, req.body.subjectId)) {
      return next(new ApiError("You are not assigned to this subject", 403));
    }
  }

  const updated = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  // Cache invalidation
  await cacheService.del(`lecture:${req.params.id}`);
  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${updated.subjectId}`);

  res.status(200).json({
    status: "success",
    data: updated,
  });
});

// ======================================================================
// DELETE LECTURE
// ======================================================================
// @desc    Delete lecture (doctor only)
// @route   DELETE /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ======================================================================
exports.deleteMyLecture = asyncHandler(async (req, res, next) => {
  const lectureId = req.params.id;

  // Log: delete attempt
  logger.info("Delete lecture attempt", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId
    }
  });

  // 1) Delete lecture only if it belongs to the doctor
  const lecture = await Lecture.findOneAndDelete({
    _id: lectureId,
    doctorId: req.user._id,
  });

  if (!lecture) {
    logger.warn("Delete lecture failed: lecture not found or not owned by doctor", {
      meta: {
        doctorId: req.user._id,
        lectureId,
        correlationId: req.correlationId
      }
    });

    return next(new ApiError("Lecture not found or not yours", 404));
  }

  logger.info("Lecture deleted from database", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      subjectId: lecture.subjectId,
      correlationId: req.correlationId
    }
  });

  // 2) Remove lecture reference from subject
  await Subject.updateOne(
    { _id: lecture.subjectId },
    { $pull: { lectures: lecture._id } }
  );

  logger.info("Lecture removed from subject", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      subjectId: lecture.subjectId,
      correlationId: req.correlationId
    }
  });

  // 3) Cache invalidation
  await cacheService.del(`lecture:${lectureId}`);
  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${lecture.subjectId}`);

  logger.info("Cache invalidated for lecture", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      subjectId: lecture.subjectId,
      correlationId: req.correlationId
    }
  });

  // 4) Response
  logger.info("Delete lecture successful", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      correlationId: req.correlationId
    }
  });

  res.status(200).json({
    status: "success",
    message: "Lecture deleted successfully",
  });
});
