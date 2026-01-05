const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const { uploadLectureFile } = require("../middlewares/uploadAnyFileMiddlware");

const {
  getMyLectures,
  getMyLecture,
  createMyLecture,
  updateMyLecture,
  deleteMyLecture,
} = require("../services/doctorService");

const router = express.Router();

// ------------------------------------------------------
// Doctor Lecture Management Routes
// ------------------------------------------------------
// @note    Doctor must be logged in + must have doctor role
router.use(protect, allowedTo("doctor"));

// ------------------------------------------------------
// @desc    Get all lectures created by this doctor
// @route   GET /api/v1/doctor/lectures
// ------------------------------------------------------
router.get("/", getMyLectures);

// ------------------------------------------------------
// @desc    Create a new lecture (only for subjects the doctor teaches)
// @route   POST /api/v1/doctor/lectures
// ------------------------------------------------------
router.post(
  "/",
  uploadLectureFile,   
  createMyLecture
);


router
  .route("/:id")
  // ------------------------------------------------------
  // @desc    Get a specific lecture created by this doctor
  // @route   GET /api/v1/doctor/lectures/:id
  // ------------------------------------------------------
  .get(getMyLecture)

  // ------------------------------------------------------
  // @desc    Update lecture (only if doctor owns it)
  // @route   PUT /api/v1/doctor/lectures/:id
  // ------------------------------------------------------
  .put(updateMyLecture)

  // ------------------------------------------------------
  // @desc    Delete lecture (only if doctor owns it)
  // @route   DELETE /api/v1/doctor/lectures/:id
  // ------------------------------------------------------
  .delete(deleteMyLecture);

module.exports = router;
