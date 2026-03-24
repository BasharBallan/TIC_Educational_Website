const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const getMessage = require('../utils/getMessage');

const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');
const cacheService = require("../services/cacheService");


// ======================================================================
// GET ALL SEMESTERS
// ======================================================================
// @desc    Get all semesters
// @route   GET /api/v1/semesters
// @access  Private/Admin
// ======================================================================
exports.getSemesters = factory.getAll(Semester);


// ======================================================================
// GET SEMESTER BY ID
// ======================================================================
// @desc    Get specific semester by id
// @route   GET /api/v1/semesters/:id
// @access  Private/Admin
// ======================================================================
exports.getSemester = factory.getOne(Semester);


// ======================================================================
// CREATE SEMESTER
// ======================================================================
// @desc    Create new semester
// @route   POST /api/v1/semesters
// @access  Private/Admin
// ======================================================================
exports.createSemester = async (req, res, next) => {
  const handler = factory.createOne(Semester);

  await handler(req, res, async () => {
    // Cache invalidation
    await cacheService.del("semesters:all");
    next();
  });
};


// ======================================================================
// UPDATE SEMESTER
// ======================================================================
// @desc    Update semester by id
// @route   PUT /api/v1/semesters/:id
// @access  Private/Admin
// ======================================================================
exports.updateSemester = async (req, res, next) => {
  const handler = factory.updateOne(Semester);

  await handler(req, res, async () => {
    await cacheService.del("semesters:all");
    await cacheService.del(`semester:${req.params.id}`);
    next();
  });
};


// ======================================================================
// DELETE SEMESTER
// ======================================================================
// @desc    Delete semester by id
// @route   DELETE /api/v1/semesters/:id
// @access  Private/Admin
// ======================================================================
exports.deleteSemester = async (req, res, next) => {
  const handler = factory.deleteOne(Semester);

  await handler(req, res, async () => {
    await cacheService.del("semesters:all");
    await cacheService.del(`semester:${req.params.id}`);
    next();
  });
};
