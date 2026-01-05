const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  addLectureToSaved,
  removeLectureFromSaved,
  getLoggedUserSavedLectures,
  deleteAllSavedLectures,
} = require("../services/savedLecturesService");

const router = express.Router();

// ------------------------------------------------------
// Saved Lectures Routes (Student / Doctor)
// ------------------------------------------------------


router
  .route("/")
  // @desc    Add lecture to saved list
  // @route   POST /api/v1/saved-lectures
  // @access  Private (student/doctor)
  .post(protect, allowedTo("student", "doctor"), addLectureToSaved)

  // @desc    Get logged user saved lectures
  // @route   GET /api/v1/saved-lectures
  // @access  Private (student/doctor)
  .get(protect, allowedTo("student", "doctor"), getLoggedUserSavedLectures)

  // @desc    Delete all saved lectures
  // @route   DELETE /api/v1/saved-lectures
  // @access  Private (student/doctor)
  .delete(protect, allowedTo("student", "doctor"), deleteAllSavedLectures);

router
  // @desc    Remove lecture from saved list
  // @route   DELETE /api/v1/saved-lectures/:lectureId
  // @access  Private (student/doctor)
  .delete(
    "/:lectureId",
    protect,
    allowedTo("student", "doctor"),
    removeLectureFromSaved
  );

module.exports = router;
