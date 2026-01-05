const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../services/subjectService");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private/Admin
router.get("/", protect, allowedTo("admin"), getSubjects);

// @desc    Create new subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
router.post("/", protect, allowedTo("admin"), createSubject);

router
  .route("/:id")
  // @desc    Get specific subject
  // @route   GET /api/v1/subjects/:id
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getSubject)

  // @desc    Update subject
  // @route   PUT /api/v1/subjects/:id
  // @access  Private/Admin
  .put(protect, allowedTo("admin"), updateSubject)

  // @desc    Delete subject
  // @route   DELETE /api/v1/subjects/:id
  // @access  Private/Admin
  .delete(protect, allowedTo("admin"), deleteSubject);

module.exports = router;
