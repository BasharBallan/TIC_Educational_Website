const asyncHandler = require('express-async-handler');

const Year = require('../models/yearModel');
const factory = require('./handlersFactory');


// ======================================================================
// GET ALL YEARS
// ======================================================================
// @desc    Get all years
// @route   GET /api/v1/years
// @access  Private/Admin
// ======================================================================
exports.getYears = factory.getAll(Year);


// ======================================================================
// GET YEAR BY ID
// ======================================================================
// @desc    Get specific year by id
// @route   GET /api/v1/years/:id
// @access  Private/Admin
// ======================================================================
exports.getYear = factory.getOne(Year);
