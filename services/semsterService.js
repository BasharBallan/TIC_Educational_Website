const Semester = require('../models/semesterModel');
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


//@desc    Add subject to a specific semester
//@route   POST /api/v1/semesters/:semesterId/subjects
//@access  Private/Admin
exports.addSubjectToSemester = asyncHandler(async (req, res, next) => {
  const semester = await Semester.findById(req.params.semesterId);
  if (!semester) {
    return next(new ApiError(getMessage('semester_not_found', req.lang), 404));
  }

  const subjectCount = await Subject.countDocuments({ semester: semester._id });
  if (subjectCount >= 8) {
    return next(new ApiError(getMessage('max_subjects_reached', req.lang), 400));
  }

  const subject = await Subject.create({
    name: req.body.name,
    code: req.body.code,
    semester: semester._id,
  });

  res.status(201).json({
    status: 'success',
    message: getMessage('subject_created', req.lang),
    data: subject,
  });
});
