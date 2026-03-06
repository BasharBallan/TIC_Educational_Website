const asyncHandler = require('express-async-handler');

const Year = require('../models/yearModel');
const factory = require('./handlersFactory');

// @desc    Get all years
// @route   GET /api/v1/years
// @access  Private/Admin
exports.getYears = factory.getAll(Year);

// @desc    Get specific year by id
// @route   GET /api/v1/years/:id
// @access  Private/Admin
exports.getYear = factory.getOne(Year);

