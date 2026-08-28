const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const { uploadLectureFile } = require("../middlewares/uploadAnyFileMiddlware");
const { cache } = require("../middlewares/cache");

const {
  getMyLectures,
  getMyLecture,
  createMyLecture,
  updateMyLecture,
  deleteMyLecture,
  getMySubjects,
} = require("../services/doctorService");

const {
  createMyLectureValidator,
  updateMyLectureValidator,
  getMyLectureValidator,
  deleteMyLectureValidator,
} = require("../utils/validators/doctorValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor Lectures
 *   description: APIs for doctors to manage their own lectures
 */

router.use(protect, allowedTo("doctor"));

/**
 * @swagger
 * /api/v1/doctors/subjects:
 *   get:
 *     summary: Get all subjects assigned to the logged-in doctor
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all subjects that the authenticated doctor teaches.
 *     responses:
 *       200:
 *         description: Subjects returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
 router.get(
   "/subjects",
   cache((req) => `subjects:doctor:${req.user._id}`),
   getMySubjects
 );

/**
 * @swagger
 * /api/v1/doctors/lectures:
 *   get:
 *     summary: Get all lectures created by the logged-in doctor
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all lectures that belong to the authenticated doctor.
 *     responses:
 *       200:
 *         description: List of doctor lectures returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/lectures",
  cache((req) => `lectures:doctor:${req.user._id}`),
  getMyLectures
);

/**
 * @swagger
 * /api/v1/doctors/lectures:
 *   post:
 *     summary: Create a new lecture (Doctor only)
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a doctor to upload a lecture file and create a lecture entry.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subjectId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Chapter 1 - Introduction"
 *               subjectId:
 *                 type: string
 *                 example: "69a085596606f42dcda87e5c"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lecture created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/lectures",
  uploadLectureFile,
  createMyLectureValidator,
  createMyLecture
);

/**
 * @swagger
 * /api/v1/doctors/lectures/{id}:
 *   get:
 *     summary: Get a single lecture created by the doctor
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "69a6f116d217b4f7a0464243"
 *           description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture returned successfully
 *       404:
 *         description: Lecture not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/lectures/:id",
  getMyLectureValidator,
  cache((req) => `lecture:${req.params.id}`),
  getMyLecture
);

/**
 * @swagger
 * /api/v1/doctors/lectures/{id}:
 *   put:
 *     summary: Update a lecture created by the doctor
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "69a6f116d217b4f7a0464243"
 *         description: Lecture ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Lecture Title"
 *               description:
 *                 type: string
 *                 example: "Updated lecture description"
 *     responses:
 *       200:
 *         description: Lecture updated successfully
 *       404:
 *         description: Lecture not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/lectures/:id",
  updateMyLectureValidator,
  updateMyLecture
);

/**
 * @swagger
 * /api/v1/doctors/lectures/{id}:
 *   delete:
 *     summary: Delete a lecture created by the doctor
 *     tags: [Doctor Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture deleted successfully
 *       404:
 *         description: Lecture not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/lectures/:id",
  deleteMyLectureValidator,
  deleteMyLecture
);

module.exports = router;
