const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getLectures,
  getLecture,
  deleteLecture,
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
router.get("/", protect, getLectures);



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

module.exports = router;
