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

// @desc    Create new year
// @route   POST /api/v1/years
// @access  Private/Admin
exports.createYear = factory.createOne(Year);

// @desc    Update year by id
// @route   PUT /api/v1/years/:id
// @access  Private/Admin
exports.updateYear = factory.updateOne(Year);

// @desc    Delete year by id
// @route   DELETE /api/v1/years/:id
// @access  Private/Admin
exports.deleteYear = factory.deleteOne(Year);

//@desc    Add semester to a specific year
//@route    POST /api/v1/years/:yearId/semesters
//@access   Private/Admin

exports.addSemesterToYear = asyncHandler(async (req, res, next) => {
  const year = await Year.findById(req.params.yearId);
  if (!year) {
    return next(new ApiError(getMessage('year_not_found', req.lang), 404));
  }

  // تحقق أن السنة ما فيها أكثر من فصلين
  const semesterCount = await Semester.countDocuments({ year: year._id });
  if (semesterCount >= 2) {
    return next(new ApiError(getMessage('max_semesters_reached', req.lang), 400));
  }

  const semester = await Semester.create({ name: req.body.name, year: year._id });

  res.status(201).json({
    status: 'success',
    message: getMessage('semester_created', req.lang),
    data: semester,
  });
});
