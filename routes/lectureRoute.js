const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
} = require("../services/lectureService");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

// @desc    Get all lectures
// @route   GET /api/v1/lectures
// @access  Private/Admin
router.get("/", protect, allowedTo("admin"), getLectures);

// @desc    Create new lecture
// @route   POST /api/v1/lectures
// @access  Private/Admin
router.post("/", protect, allowedTo("admin"), createLecture);

router
  .route("/:id")
  // @desc    Get specific lecture
  // @route   GET /api/v1/lectures/:id
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getLecture)

  // @desc    Update lecture
  // @route   PUT /api/v1/lectures/:id
  // @access  Private/Admin
  .put(protect, allowedTo("admin"), updateLecture)

  // @desc    Delete lecture
  // @route   DELETE /api/v1/lectures/:id
  // @access  Private/Admin
  .delete(protect, allowedTo("admin"), deleteLecture);

module.exports = router;
