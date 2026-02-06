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

const {
  createMyLectureValidator,
  updateMyLectureValidator,
  getMyLectureValidator,
  deleteMyLectureValidator,
} = require("../utils/validators/doctorValidator");

const router = express.Router();

// Doctor must be logged in + must have doctor role
router.use(protect, allowedTo("doctor"));

// Get all lectures
router.get("/", getMyLectures);

// Create lecture
router.post(
  "/",
  uploadLectureFile,
  createMyLectureValidator,
  createMyLecture
);

router
  .route("/:id")
  .get(getMyLectureValidator, getMyLecture)
  .put(updateMyLectureValidator, updateMyLecture)
  .delete(deleteMyLectureValidator, deleteMyLecture);

module.exports = router;
