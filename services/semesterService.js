const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const getMessage = require('../utils/getMessage');

const Semester = require('../models/semesterModel');
const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');

// @desc    Get all semesters
// @route   GET /api/v1/semesters
// @access  Private/Admin
exports.getSemesters = factory.getAll(Semester);

// @desc    Get specific semester by id
// @route   GET /api/v1/semesters/:id
// @access  Private/Admin
exports.getSemester = factory.getOne(Semester);

// @desc    Create new semester
// @route   POST /api/v1/semesters
// @access  Private/Admin
exports.createSemester = factory.createOne(Semester);

// @desc    Update semester by id
// @route   PUT /api/v1/semesters/:id
// @access  Private/Admin
exports.updateSemester = factory.updateOne(Semester);

// @desc    Delete semester by id
// @route   DELETE /api/v1/semesters/:id
// @access  Private/Admin
exports.deleteSemester = factory.deleteOne(Semester);


