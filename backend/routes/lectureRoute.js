const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const { cache } = require("../middlewares/cache");

const {

  getLectures,
  getLecture,
  deleteLecture,
  getMyLectures,
  getLecturesBySubject,
} = require("../services/lectureService");

const {
  getLectureValidator,
  deleteLectureValidator,
} = require("../utils/validators/lectureValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lectures
 *   description: Lecture management APIs
 */

// ------------------------------------------------------
// Admin Routes (CRUD)
// ------------------------------------------------------

/**
 * @swagger
 * /api/v1/lectures:
 *   get:
 *     summary: Get all lectures
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of all lectures ( anyone can access this endpoint)
 *     responses:
 *       200:
 *         description: List of lectures returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  protect,
  cache(() => "lectures:all"),
  getLectures
);
router.get("/my-lectures", protect, allowedTo("student"), getMyLectures);

/**
 * @swagger
 * /api/v1/lectures/{id}:
 *   get:
 *     summary: Get a single lecture
 *     tags: [Lectures]
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
 *     responses:
 *       200:
 *         description: Lecture data returned successfully
 *       404:
 *         description: Lecture not found
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  protect,
  getLectureValidator,
  cache((req) => `lecture:${req.params.id}`),
  getLecture
);

/**
 * @swagger
 * /api/v1/lectures/{id}:
 *   delete:
 *     summary: Delete a lecture
 *     tags: [Lectures]
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
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteLectureValidator,
  deleteLecture
);


router.get(
  "/subject/:subjectId",
  protect,
  allowedTo("student", "doctor", "admin"),
  getLecturesBySubject
);


module.exports = router;
