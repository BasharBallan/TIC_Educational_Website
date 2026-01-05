const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  addSubjectToSemester,
} = require("../services/semesterService");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

// @desc    Get all semesters
// @route   GET /api/v1/semesters
// @access  Private/Admin
router.get("/", protect, allowedTo("admin"), getSemesters);

// @desc    Create new semester
// @route   POST /api/v1/semesters
// @access  Private/Admin
router.post("/", protect, allowedTo("admin"), createSemester);

router
  .route("/:id")
  // @desc    Get specific semester
  // @route   GET /api/v1/semesters/:id
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getSemester)

  // @desc    Update semester
  // @route   PUT /api/v1/semesters/:id
  // @access  Private/Admin
  .put(protect, allowedTo("admin"), updateSemester)

  // @desc    Delete semester
  // @route   DELETE /api/v1/semesters/:id
  // @access  Private/Admin
  .delete(protect, allowedTo("admin"), deleteSemester);

// ------------------------------------------------------
// Add Subject to Semester
// ------------------------------------------------------

// @desc    Add subject to a specific semester
// @route   POST /api/v1/semesters/:semesterId/subjects
// @access  Private/Admin
router.post(
  "/:semesterId/subjects",
  protect,
  allowedTo("admin"),
  addSubjectToSemester
);

module.exports = router;
