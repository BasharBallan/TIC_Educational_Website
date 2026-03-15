const Lecture = require('../models/lectureModel');
const factory = require('./handlersFactory');
const cacheService = require("../services/cacheService");

// @desc    Get all lectures
// @route   GET /api/v1/lectures
// @access  Private/Admin
exports.getLectures = factory.getAll(Lecture);

// @desc    Get specific lecture by id
// @route   GET /api/v1/lectures/:id
// @access  Private/Admin
exports.getLecture = factory.getOne(Lecture);

// @desc    Delete lecture by id
// @route   DELETE /api/v1/lectures/:id
// @access  Private/Admin
exports.deleteLecture = async (req, res, next) => {
  const handler = factory.deleteOne(Lecture);

  await handler(req, res, async () => {
    // Cache invalidation
    await cacheService.del(`lecture:${req.params.id}`);
    await cacheService.del("lectures:all");
    next();
  });
};
