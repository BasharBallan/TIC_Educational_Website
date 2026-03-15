const express = require("express");
const { protect, allowedTo } = require("../services/authService");
const { cache } = require("../middlewares/cache");

const {
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
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
router.get(
  "/",
  protect,
  allowedTo("admin"),
  cache(() => "semesters:all"),
  getSemesters
);

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
router.get(
  "/:id",
  protect,
  allowedTo("admin"),
  cache((req) => `semester:${req.params.id}`),
  getSemester
);

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

module.exports = router;
