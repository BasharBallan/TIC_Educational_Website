const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getYears,
  getYear,
  createYear,
  updateYear,
  deleteYear,
  addSemesterToYear,
} = require("../services/yearService");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

// @desc    Get all years
// @route   GET /api/v1/years
// @access  Private/Admin
router.get("/", protect, allowedTo("admin"), getYears);

// @desc    Create new year
// @route   POST /api/v1/years
// @access  Private/Admin
router.post("/", protect, allowedTo("admin"), createYear);

router
  .route("/:id")
  // @desc    Get specific year
  // @route   GET /api/v1/years/:id
  // @access  Private/Admin
  .get(protect, allowedTo("admin"), getYear)

  // @desc    Update year
  // @route   PUT /api/v1/years/:id
  // @access  Private/Admin
  .put(protect, allowedTo("admin"), updateYear)

  // @desc    Delete year
  // @route   DELETE /api/v1/years/:id
  // @access  Private/Admin
  .delete(protect, allowedTo("admin"), deleteYear);

// ------------------------------------------------------
// Add Semester to Year
// ------------------------------------------------------

// @desc    Add semester to a specific year
// @route   POST /api/v1/years/:yearId/semesters
// @access  Private/Admin
router.post(
  "/:yearId/semesters",
  protect,
  allowedTo("admin"),
  addSemesterToYear
);

module.exports = router;
