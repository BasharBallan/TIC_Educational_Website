const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private/Admin
exports.getSubjects = factory.getAll(Subject);

// @desc    Get specific subject by id
// @route   GET /api/v1/subjects/:id
// @access  Private/Admin
exports.getSubject = factory.getOne(Subject);

// @desc    Create new subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
exports.createSubject = factory.createOne(Subject);

// @desc    Update subject by id
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
exports.updateSubject = factory.updateOne(Subject);

// @desc    Delete subject by id
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = factory.deleteOne(Subject);
