const asyncHandler = require('express-async-handler');
const mongoose = require("mongoose");
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const getMessage = require('../utils/getMessage');


// @desc    Add lecture to saved list
// @route   POST /api/v1/saved-lectures
// @access  Protected/User
exports.addLectureToSaved = asyncHandler(async (req, res, next) => {
  const lectureId = req.body.lectureId;

  if (!mongoose.Types.ObjectId.isValid(lectureId)) {
    return next(new ApiError("Invalid lecture ID format", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { "studentData.savedLectures": lectureId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: getMessage("lecture_saved", req.lang),
    data: user.studentData.savedLectures,
  });
});


// @desc    Remove lecture from saved list
// @route   DELETE /api/v1/saved-lectures/:lectureId
// @access  Protected/User
exports.removeLectureFromSaved = asyncHandler(async (req, res, next) => {
  const lectureId = req.params.lectureId;

  if (!mongoose.Types.ObjectId.isValid(lectureId)) {
    return next(new ApiError("Invalid lecture ID format", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { "studentData.savedLectures": lectureId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: getMessage("lecture_unsaved", req.lang),
    data: user.studentData.savedLectures,
  });
});


// @desc    Get logged user saved lectures
// @route   GET /api/v1/saved-lectures
// @access  Protected/User
exports.getLoggedUserSavedLectures = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "studentData.savedLectures"
  );

  res.status(200).json({
    status: 'success',
    results: user.studentData.savedLectures.length,
    data: user.studentData.savedLectures,
  });
});


// @desc    Delete all saved lectures
// @route   DELETE /api/v1/saved-lectures
// @access  Protected/User
exports.deleteAllSavedLectures = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { "studentData.savedLectures": [] },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: getMessage("saved_lectures_cleared", req.lang),
    data: user.studentData.savedLectures,
  });
});
