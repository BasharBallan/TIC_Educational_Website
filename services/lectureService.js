const Lecture = require('../models/lectureModel');
const factory = require('./handlersFactory');

// @desc    Get all lectures
// @route   GET /api/v1/lectures
// @access  Private/Admin
exports.getLectures = factory.getAll(Lecture);

// @desc    Get specific lecture by id
// @route   GET /api/v1/lectures/:id
// @access  Private/Admin
exports.getLecture = factory.getOne(Lecture);

// @desc    Create new lecture
// @route   POST /api/v1/lectures
// @access  Private/Admin
exports.createLecture = factory.createOne(Lecture);

// @desc    Update lecture by id
// @route   PUT /api/v1/lectures/:id
// @access  Private/Admin
exports.updateLecture = factory.updateOne(Lecture);

// @desc    Delete lecture by id
// @route   DELETE /api/v1/lectures/:id
// @access  Private/Admin
exports.deleteLecture = factory.deleteOne(Lecture);
