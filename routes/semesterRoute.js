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

// const {
//   createSemesterValidator,
//   getSemesterValidator,
//   updateSemesterValidator,
//   deleteSemesterValidator,
//   addSubjectToSemesterValidator,
// } = require("../utils/validators/semesterValidator");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

router.get("/", protect, allowedTo("admin"), getSemesters);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  // createSemesterValidator,
  createSemester
);

router
  .route("/:id")
  .get(
    protect,
    allowedTo("admin"),
    // getSemesterValidator,
    getSemester
  )
  .put(
    protect,
    allowedTo("admin"),
    // updateSemesterValidator,
    updateSemester
  )
  .delete(
    protect,
    allowedTo("admin"),
    // deleteSemesterValidator,
    deleteSemester
  );

// ------------------------------------------------------
// Add Subject to Semester
// ------------------------------------------------------

router.post(
  "/:semesterId/subjects",
  protect,
  allowedTo("doctor"),
  // addSubjectToSemesterValidator,
  addSubjectToSemester
);

module.exports = router;
