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

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Semesters
 *   description: Semester management APIs (Admin only)
 */

/**
 * @swagger
 * /api/v1/semesters:
 *   get:
 *     summary: Get all semesters
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of all semesters (Admin only)
 *     responses:
 *       200:
 *         description: List of semesters returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", protect, allowedTo("admin"), getSemesters);

/**
 * @swagger
 * /api/v1/semesters:
 *   post:
 *     summary: Create a new semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new semester under a specific year.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - yearId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Semester 1"
 *               yearId:
 *                 type: string
 *                 example: "69846ab7b74a34d9a081f303"
 *     responses:
 *       201:
 *         description: Semester created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", protect, allowedTo("admin"), createSemester);

/**
 * @swagger
 * /api/v1/semesters/{id}:
 *   get:
 *     summary: Get a single semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Semester returned successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/:id", protect, allowedTo("admin"), getSemester);

/**
 * @swagger
 * /api/v1/semesters/{id}:
 *   put:
 *     summary: Update a semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Semester Name"
 *     responses:
 *       200:
 *         description: Semester updated successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", protect, allowedTo("admin"), updateSemester);

/**
 * @swagger
 * /api/v1/semesters/{id}:
 *   delete:
 *     summary: Delete a semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Semester deleted successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", protect, allowedTo("admin"), deleteSemester);

/**
 * @swagger
 * /api/v1/semesters/{semesterId}/subjects:
 *   post:
 *     summary: Add a subject to a semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a doctor to add a subject to a semester.
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Semester ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: string
 *                 example: "69857b2353683e8b81ca91b3"
 *     responses:
 *       200:
 *         description: Subject added to semester successfully
 *       404:
 *         description: Semester or subject not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:semesterId/subjects",
  protect,
  allowedTo("admin"),
  addSubjectToSemester
);

module.exports = router;
