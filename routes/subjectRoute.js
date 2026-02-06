const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../services/subjectService");

const {
  createSubjectValidator,
  getSubjectValidator,
  updateSubjectValidator,
  deleteSubjectValidator,
} = require("../utils/validators/subjectValidator");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

router.get("/", protect, allowedTo("admin"), getSubjects);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  createSubjectValidator,
  createSubject
);

router
  .route("/:id")
  .get(
    protect,
    allowedTo("admin"),
    getSubjectValidator,
    getSubject
  )
  .put(
    protect,
    allowedTo("admin"),
    updateSubjectValidator,
    updateSubject
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubjectValidator,
    deleteSubject
  );

module.exports = router;
