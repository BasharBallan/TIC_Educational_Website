const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  addLectureToSaved,
  removeLectureFromSaved,
  getLoggedUserSavedLectures,
  deleteAllSavedLectures,
} = require("../services/savedLecturesService");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Saved Lectures
 *   description: APIs for saving and managing saved lectures (Student & Doctor)
 */

/**
 * @swagger
 * /api/v1/saved-lectures:
 *   post:
 *     summary: Add lecture to saved list
 *     tags: [Saved Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a student or doctor to save a lecture to their saved list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lectureId
 *             properties:
 *               lectureId:
 *                 type: string
 *                 example: "69867ec91ff535e09b23db5a"
 *     responses:
 *       201:
 *         description: Lecture added to saved list successfully
 *       400:
 *         description: Invalid lecture ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 *   get:
 *     summary: Get logged user's saved lectures
 *     tags: [Saved Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all lectures saved by the authenticated user.
 *     responses:
 *       200:
 *         description: List of saved lectures returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 *   delete:
 *     summary: Delete all saved lectures
 *     tags: [Saved Lectures]
 *     security:
 *       - bearerAuth: []
 *     description: Removes all saved lectures for the logged-in user.
 *     responses:
 *       200:
 *         description: All saved lectures deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router
  .route("/")
  .post(protect, allowedTo("student", "doctor"), addLectureToSaved)
  .get(protect, allowedTo("student", "doctor"), getLoggedUserSavedLectures)
  .delete(protect, allowedTo("student", "doctor"), deleteAllSavedLectures);

/**
 * @swagger
 * /api/v1/saved-lectures/{lectureId}:
 *   delete:
 *     summary: Remove a lecture from saved list
 *     tags: [Saved Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lectureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lecture to remove
 *     responses:
 *       200:
 *         description: Lecture removed from saved list successfully
 *       404:
 *         description: Lecture not found in saved list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:lectureId",
  protect,
  allowedTo("student", "doctor"),
  removeLectureFromSaved
);

module.exports = router;
