const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getYears,
  getYear,
  createYear,
  updateYear,
  deleteYear,
  addSemesterToYear,
} = require("../services/yearService");

const {
  createYearValidator,
  getYearValidator,
  updateYearValidator,
  deleteYearValidator,
  addSemesterToYearValidator,
} = require("../utils/validators/yearValidator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Years
 *   description: Year management APIs (Admin only)
 */

/**
 * @swagger
 * /api/v1/years:
 *   get:
 *     summary: Get all years
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of all academic years (Admin only).
 *     responses:
 *       200:
 *         description: List of years returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", protect, allowedTo("admin"), getYears);

/**
 * @swagger
 * /api/v1/years:
 *   post:
 *     summary: Create a new year
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new academic year (Admin only).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Year 1"
 *     responses:
 *       201:
 *         description: Year created successfully
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
  createYearValidator,
  createYear
);

/**
 * @swagger
 * /api/v1/years/{id}:
 *   get:
 *     summary: Get a single year
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Year ID
 *     responses:
 *       200:
 *         description: Year returned successfully
 *       404:
 *         description: Year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  protect,
  allowedTo("admin"),
  getYearValidator,
  getYear
);

/**
 * @swagger
 * /api/v1/years/{id}:
 *   put:
 *     summary: Update a year
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Year Name"
 *     responses:
 *       200:
 *         description: Year updated successfully
 *       404:
 *         description: Year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  updateYearValidator,
  updateYear
);

/**
 * @swagger
 * /api/v1/years/{id}:
 *   delete:
 *     summary: Delete a year
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Year ID
 *     responses:
 *       200:
 *         description: Year deleted successfully
 *       404:
 *         description: Year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteYearValidator,
  deleteYear
);

/**
 * @swagger
 * /api/v1/years/{yearId}/semesters:
 *   post:
 *     summary: Add a semester to a year
 *     tags: [Years]
 *     security:
 *       - bearerAuth: []
 *     description: Admin can add a semester to a specific academic year.
 *     parameters:
 *       - in: path
 *         name: yearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semesterId
 *             properties:
 *               semesterId:
 *                 type: string
 *                 example: "65d8f3b2c9a1e4a8b3f1a555"
 *     responses:
 *       200:
 *         description: Semester added to year successfully
 *       404:
 *         description: Year or semester not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:yearId/semesters",
  protect,
  allowedTo("admin"),
  addSemesterToYearValidator,
  addSemesterToYear
);

module.exports = router;
