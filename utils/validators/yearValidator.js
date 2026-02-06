const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// ------------------------------------------------------
// Create Year
// ------------------------------------------------------
exports.createYearValidator = [
  check("name")
    .notEmpty()
    .withMessage("Year name is required")
    .isLength({ min: 2 })
    .withMessage("Year name must be at least 2 characters"),

  check("code")
    .notEmpty()
    .withMessage("Year code is required")
    .isLength({ min: 2 })
    .withMessage("Year code must be at least 2 characters"),

  check("description").optional(),

  validatorMiddleware,
];

// ------------------------------------------------------
// Get Year by ID
// ------------------------------------------------------
exports.getYearValidator = [
  check("id").isMongoId().withMessage("Invalid year ID format"),
  validatorMiddleware,
];

// ------------------------------------------------------
// Update Year
// ------------------------------------------------------
exports.updateYearValidator = [
  check("id").isMongoId().withMessage("Invalid year ID format"),

  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Year name must be at least 2 characters"),

  check("code")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Year code must be at least 2 characters"),

  check("description").optional(),

  validatorMiddleware,
];

// ------------------------------------------------------
// Delete Year
// ------------------------------------------------------
exports.deleteYearValidator = [
  check("id").isMongoId().withMessage("Invalid year ID format"),
  validatorMiddleware,
];

// ------------------------------------------------------
// Add Semester to Year
// ------------------------------------------------------
exports.addSemesterToYearValidator = [
  check("yearId").isMongoId().withMessage("Invalid year ID format"),

  check("name")
    .notEmpty()
    .withMessage("Semester name is required")
    .isLength({ min: 2 })
    .withMessage("Semester name must be at least 2 characters"),

  validatorMiddleware,
];
