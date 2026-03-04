const asyncHandler = require("express-async-handler");
const Lecture = require("../models/lectureModel");
const User = require("../models/userModel");
const Subject = require("../models/subjectModel");
const ApiError = require("../utils/apiError");
const { uploadLectureFile } = require("../middlewares/uploadAnyFileMiddlware");
// ------------------------------------------------------
// Helper Function
// ------------------------------------------------------
// @desc    Check if doctor teaches this subject
// @note    Prevents unauthorized lecture creation/update
const doctorTeachesSubject = (doctor, subjectId) => {
  return doctor.doctorData.subjects.some(
    (sub) => sub.toString() === subjectId.toString()
  );
};

// ------------------------------------------------------
// @desc    Get all lectures created by this doctor
// @route   GET /api/v1/doctor/lectures
// @access  Private/Doctor
// ------------------------------------------------------
exports.getMyLectures = asyncHandler(async (req, res, next) => {
  const lectures = await Lecture.find({ doctor: req.user._id });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: lectures,
  });
});

// ------------------------------------------------------
// @desc    Get a specific lecture created by this doctor
// @route   GET /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ------------------------------------------------------
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

// ------------------------------------------------------
// @desc    Create a new lecture (only for subjects the doctor teaches)
// @route   POST /api/v1/doctor/lectures
// @access  Private/Doctor
// ------------------------------------------------------
exports.createMyLecture = asyncHandler(async (req, res, next) => {
  const { title, description, subjectId } = req.body;

  // 1) Check subject exists
  const subjectDoc = await Subject.findById(subjectId);
  if (!subjectDoc) {
    return next(new ApiError("Subject not found", 404));
  }

  // 2) Check doctor teaches this subject
  if (!doctorTeachesSubject(req.user, subjectId)) {
    return next(new ApiError("You are not assigned to this subject", 403));
  }

  // 3) Handle file upload
  let fileData = null;
  if (req.file) {
    fileData = {
      url: `/uploads/lectures/${req.file.filename}`,
      type: req.file.mimetype,
    };
  }

  // 4) Create lecture
  const lecture = await Lecture.create({
    title,
    description,
    subjectId,
    doctorId: req.user._id,
    file: fileData,
  });

  // 5) Add lecture to subject
  await Subject.findByIdAndUpdate(subjectId, {
    $push: { lectures: lecture._id }
  });

  // 6) Add lecture to doctor (inside user.doctorData.lectures)
  await User.findByIdAndUpdate(req.user._id, {
    $push: { "doctorData.lectures": lecture._id }
  });

  // 7) Response
  res.status(201).json({
    status: "success",
    data: lecture,
  });
});

// ------------------------------------------------------
// @desc    Update lecture (only if doctor owns it)
// @route   PUT /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ------------------------------------------------------
exports.updateMyLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findOne({
    _id: req.params.id,
    doctorId: req.user._id,
  });

  if (!lecture) {
    return next(new ApiError("Lecture not found or not yours", 404));
  }

  // If subject is being changed → validate again
  if (req.body.subject) {
    if (!doctorTeachesSubject(req.user, req.body.subject)) {
      return next(new ApiError("You are not assigned to this subject", 403));
    }
  }

  const updated = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: updated,
  });
});

// ------------------------------------------------------
// @desc    Delete lecture (only if doctor owns it)
// @route   DELETE /api/v1/doctor/lectures/:id
// @access  Private/Doctor
// ------------------------------------------------------
exports.deleteMyLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findOneAndDelete({
    _id: req.params.id,
    doctorId: req.user._id,
  });

  if (!lecture) {
    return next(new ApiError("Lecture not found or not yours", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Lecture deleted successfully",
  });
});
