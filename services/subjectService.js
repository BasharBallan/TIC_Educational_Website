const Subject = require('../models/subjectModel');
const factory = require('./handlersFactory');
const User = require("../models/userModel");
const Year = require("../models/yearModel");
const Semester = require("../models/semesterModel");

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
// @access  Private/Adminexports.createSubject = async (req, res, next) => {
  exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, description, doctorId, yearId, semesterId } = req.body;

    const subject = await Subject.create({
      name,
      code,
      description,
      doctorId: doctorId,
      yearId: yearId,
      semesterId: semesterId
    });

 await User.findByIdAndUpdate(doctorId, {
  $push: { "doctorData.subjects": subject._id }
});


    await Year.findByIdAndUpdate(yearId, {
      $push: { subjects: subject._id }
    });

    await Semester.findByIdAndUpdate(semesterId, {
      $push: { subjects: subject._id }
    });

    res.status(201).json({
      status: "success",
      data: subject
    });

  } catch (err) {
    next(err);
  }
};




// @desc    Update subject by id
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
exports.updateSubject = factory.updateOne(Subject);

// @desc    Delete subject by id
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = factory.deleteOne(Subject);
