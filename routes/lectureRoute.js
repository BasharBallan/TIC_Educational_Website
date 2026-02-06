const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
} = require("../services/lectureService");

const {
  createLectureValidator,
  getLectureValidator,
  updateLectureValidator,
  deleteLectureValidator,
} = require("../utils/validators/lectureValidator");

const router = express.Router();

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

router.get("/", protect, allowedTo("admin"), getLectures);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  createLectureValidator,
  createLecture
);

router
  .route("/:id")
  .get(
    protect,
    allowedTo("admin"),
    getLectureValidator,
    getLecture
  )
  .put(
    protect,
    allowedTo("admin"),
    updateLectureValidator,
    updateLecture
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteLectureValidator,
    deleteLecture
  );

module.exports = router;
