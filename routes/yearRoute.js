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

const {
  createYearValidator,
  getYearValidator,
  updateYearValidator,
  deleteYearValidator,
  addSemesterToYearValidator,
} = require("../utils/validators/yearValidator");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

router.get("/", protect, allowedTo("admin"), getYears);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  createYearValidator,
  createYear
);

router
  .route("/:id")
  .get(protect, allowedTo("admin"), getYearValidator, getYear)
  .put(protect, allowedTo("admin"), updateYearValidator, updateYear)
  .delete(protect, allowedTo("admin"), deleteYearValidator, deleteYear);

// ------------------------------------------------------
// Add Semester to Year
// ------------------------------------------------------

router.post(
  "/:yearId/semesters",
  protect,
  allowedTo("admin"),
  addSemesterToYearValidator,
  addSemesterToYear
);

module.exports = router;
