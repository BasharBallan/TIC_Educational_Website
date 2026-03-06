const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getYears,
  getYear,

} = require("../services/yearService");

const {
  getYearValidator,

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



module.exports = router;
