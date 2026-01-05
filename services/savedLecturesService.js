const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Add lecture to saved list
// @route   POST /api/v1/saved-lectures
// @access  Protected/User
exports.addLectureToSaved = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { savedLectures: req.body.lectureId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Lecture added successfully to your saved list.',
    data: user.savedLectures,
  });
});

// @desc    Remove lecture from saved list
// @route   DELETE /api/v1/saved-lectures/:lectureId
// @access  Protected/User
exports.removeLectureFromSaved = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { savedLectures: req.params.lectureId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Lecture removed successfully from your saved list.',
    data: user.savedLectures,
  });
});

// @desc    Get logged user saved lectures
// @route   GET /api/v1/saved-lectures
// @access  Protected/User
exports.getLoggedUserSavedLectures = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('savedLectures');

  res.status(200).json({
    status: 'success',
    results: user.savedLectures.length,
    data: user.savedLectures,
  });
});


// @desc    Delete all saved lectures
// @route   DELETE /api/v1/saved-lectures
// @access  Protected/User
exports.deleteAllSavedLectures = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { savedLectures: [] } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All saved lectures have been deleted successfully.',
    data: user.savedLectures,
  });
});
