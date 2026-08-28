const asyncHandler = require("express-async-handler");
const Lecture = require("../models/lectureModel");
const User = require("../models/userModel");
const Subject = require("../models/subjectModel");
const Notification = require("../models/notificationModel");
const ApiError = require("../utils/apiError");
const cacheService = require("./cacheService");
const logger = require("../utils/logger");
const { sendNotification } = require("./notificationEmitter");

// ======================================================================
// HELPER: Check if doctor teaches a specific subject
// ======================================================================
const doctorTeachesSubject = (doctor, subjectId) =>
  doctor.doctorData.subjects.some(
    (sub) => sub.toString() === subjectId.toString()
  );

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
  const { title, description, subjectId, content } = req.body;

  logger.info("Create lecture attempt", {
    meta: {
      doctorId: req.user._id,
      subjectId,
      title,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId,
    },
  });

  const subjectDoc = await Subject.findById(subjectId);
  if (!subjectDoc) {
    return next(new ApiError("Subject not found", 404));
  }

  if (!doctorTeachesSubject(req.user, subjectId)) {
    return next(new ApiError("You are not assigned to this subject", 403));
  }

  let fileData = null;
  if (req.file) {
    fileData = {
      url: `/uploads/lectures/${req.file.filename}`,
      type: req.file.mimetype,
    };
  }

  let quizData = null;
  if (req.body.quiz) {
    try {
      quizData = JSON.parse(req.body.quiz);
    } catch (err) {
      return next(new ApiError("Invalid quiz format", 400));
    }
  }

  const lecture = await Lecture.create({
    title,
    description,
    subjectId,
    doctorId: req.user._id,
    file: fileData,
    content: content || null,
    quiz: quizData || [],
  });

  await Subject.findByIdAndUpdate(subjectId, {
    $push: { lectures: lecture._id },
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { "doctorData.lectures": lecture._id },
  });

  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${subjectId}`);

  // ======================================================================
  // REAL-TIME + DATABASE NOTIFICATION (students by year only)
  // ======================================================================
  try {
    const yearId = subjectDoc.yearId;

    const students = await User.find({
      role: "student",
      "studentData.year": subjectDoc.yearId,
    }).select("_id");

    if (req.io && students.length > 0) {
      await Promise.all(
        students.map(async (student) => {
          if (student._id.toString() === req.user._id.toString()) return;

          const notification = await Notification.create({
            userId: student._id,
            type: "lecture:new",
            message: `New lecture added: ${lecture.title}`,
            payload: {
              lectureId: lecture._id,
              subjectId: lecture.subjectId,
              doctorId: lecture.doctorId,
              title: lecture.title,
            },
          });

          // Real-time emit to student's room
          req.io.to(student._id.toString()).emit("notification:new", {
            type: "lecture:new",
            message: notification.message,
            payload: notification.payload,
          });
        })
      );
    }
  } catch (err) {
    logger.error("Real-time notification failed (lecture:new)", {
      meta: {
        doctorId: req.user._id,
        subjectId,
        lectureId: lecture._id,
        error: err.message,
        correlationId: req.correlationId,
      },
    });
  }
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

  if (req.body.subjectId) {
    if (!doctorTeachesSubject(req.user, req.body.subjectId)) {
      return next(new ApiError("You are not assigned to this subject", 403));
    }
  }

  const updated = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  await cacheService.del(`lecture:${req.params.id}`);
  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${updated.subjectId}`);

  // ======================================================================
  // REAL-TIME + DATABASE NOTIFICATION (students by year only)
  // ======================================================================
  try {
    const subjectDoc = await Subject.findById(updated.subjectId);
    const yearId = subjectDoc.yearId;

    const students = await User.find({
      role: "student",
      yearId: yearId,
    }).select("_id");

    if (req.io && students.length > 0) {
      await Promise.all(
        students.map(async (student) => {
          if (student._id.toString() === req.user._id.toString()) return;

          const notification = await Notification.create({
            userId: student._id,
            type: "lecture:update",
            message: `Lecture updated: ${updated.title}`,
            payload: {
              lectureId: updated._id,
              subjectId: updated.subjectId,
              doctorId: updated.doctorId,
              title: updated.title,
            },
          });

          sendNotification(
            req.io,
            student._id,
            "lecture:update",
            notification.message,
            notification.payload
          );
        })
      );
    } else if (req.io) {
      const allStudents = await User.find({ role: "student" }).select("_id");

      await Promise.all(
        allStudents.map(async (student) => {
          const notification = await Notification.create({
            userId: student._id,
            type: "lecture:update",
            message: `Lecture updated: ${updated.title}`,
            payload: {
              lectureId: updated._id,
              subjectId: updated.subjectId,
              doctorId: updated.doctorId,
              title: updated.title,
            },
          });

          sendNotification(
            req.io,
            student._id,
            "lecture:update",
            notification.message,
            notification.payload
          );
        })
      );
    }
  } catch (err) {
    logger.error("Real-time notification failed (lecture:update)", {
      meta: {
        doctorId: req.user._id,
        lectureId: updated._id,
        error: err.message,
        correlationId: req.correlationId,
      },
    });
  }

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

  logger.info("Delete lecture attempt", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId,
    },
  });

  const lecture = await Lecture.findOneAndDelete({
    _id: lectureId,
    doctorId: req.user._id,
  });

  if (!lecture) {
    logger.warn("Delete lecture failed: lecture not found or not owned by doctor", {
      meta: {
        doctorId: req.user._id,
        lectureId,
        correlationId: req.correlationId,
      },
    });

    return next(new ApiError("Lecture not found or not yours", 404));
  }

  logger.info("Lecture deleted from database", {
    meta: {
      doctorId: req.user._id,
      lectureId,
      subjectId: lecture.subjectId,
      correlationId: req.correlationId,
    },
  });

  await Subject.updateOne(
    { _id: lecture.subjectId },
    { $pull: { lectures: lecture._id } }
  );

  await cacheService.del(`lecture:${lectureId}`);
  await cacheService.del(`lectures:doctor:${req.user._id}`);
  await cacheService.del(`lectures:subject:${lecture.subjectId}`);

  // ======================================================================
  // REAL-TIME + DATABASE NOTIFICATION (students by year only)
  // ======================================================================
  try {
    const subjectDoc = await Subject.findById(lecture.subjectId);
    const yearId = subjectDoc.yearId;

    const students = await User.find({
      role: "student",
      yearId: yearId,
    }).select("_id");

    if (req.io && students.length > 0) {
      await Promise.all(
        students.map(async (student) => {
          if (student._id.toString() === req.user._id.toString()) return;

          const notification = await Notification.create({
            userId: student._id,
            type: "lecture:delete",
            message: `Lecture deleted: ${lecture.title}`,
            payload: {
              lectureId: lecture._id,
              subjectId: lecture.subjectId,
              doctorId: lecture.doctorId,
              title: lecture.title,
            },
          });

          sendNotification(
            req.io,
            student._id,
            "lecture:delete",
            notification.message,
            notification.payload
          );
        })
      );
    } else if (req.io) {
      const allStudents = await User.find({ role: "student" }).select("_id");

      await Promise.all(
        allStudents.map(async (student) => {
          const notification = await Notification.create({
            userId: student._id,
            type: "lecture:delete",
            message: `Lecture deleted: ${lecture.title}`,
            payload: {
              lectureId: lecture._id,
              subjectId: lecture.subjectId,
              doctorId: lecture.doctorId,
              title: lecture.title,
            },
          });

          sendNotification(
            req.io,
            student._id,
            "lecture:delete",
            notification.message,
            notification.payload
          );
        })
      );
    }
  } catch (err) {
    logger.error("Real-time notification failed (lecture:delete)", {
      meta: {
        doctorId: req.user._id,
        lectureId: lecture._id,
        error: err.message,
        correlationId: req.correlationId,
      },
    });
  }

  res.status(200).json({
    status: "success",
    message: "Lecture deleted successfully",
  });
});

// ======================================================================
// GET MY SUBJECTS
// ======================================================================
// @desc    Get all subjects assigned to the logged-in doctor
// @route   GET /api/v1/doctor/subjects
// @access  Private/Doctor
// ======================================================================
exports.getMySubjects = asyncHandler(async (req, res, next) => {
  logger.info("Fetch doctor subjects attempt", {
    meta: {
      doctorId: req.user._id,
      ip: req.ip,
      device: req.headers["user-agent"],
      correlationId: req.correlationId,
    },
  });

  const subjects = await Subject.find({ doctorId: req.user._id }).select(
    "name _id year"
  );

  if (!subjects.length) {
    logger.warn("No subjects found for doctor", {
      meta: {
        doctorId: req.user._id,
        correlationId: req.correlationId,
      },
    });

    return res.status(200).json({
      status: "success",
      results: 0,
      data: [],
    });
  }

  logger.info("Doctor subjects fetched successfully", {
    meta: {
      doctorId: req.user._id,
      subjectsCount: subjects.length,
      correlationId: req.correlationId,
    },
  });

  res.status(200).json({
    status: "success",
    results: subjects.length,
    data: subjects,
  });
});
