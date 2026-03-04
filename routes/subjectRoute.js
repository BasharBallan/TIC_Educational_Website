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

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management APIs (Admin only)
 */

/**
 * @swagger
 * /api/v1/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of all subjects (Admin only)
 *     responses:
 *       200:
 *         description: List of subjects returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", protect, allowedTo("admin"), getSubjects);

/**
 * @swagger
 * /api/v1/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new subject under a specific semester.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - semesterId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Data Structures"
 *               semesterId:
 *                 type: string
 *                 example: "65d8f3b2c9a1e4a8b3f1a123"
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  protect,
  allowedTo("admin"),
  createSubjectValidator,
  createSubject
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   get:
 *     summary: Get a single subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject returned successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  protect,
  allowedTo("admin"),
  getSubjectValidator,
  getSubject
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Advanced Data Structures"
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  updateSubjectValidator,
  updateSubject
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteSubjectValidator,
  deleteSubject
);

module.exports = router;
