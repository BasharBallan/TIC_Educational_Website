const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// ------------------------------------------------------
// Create Lecture
// ------------------------------------------------------
exports.createMyLectureValidator = [
  check("title")
    .notEmpty()
    .withMessage("Lecture title is required")
    .isLength({ min: 3 })
    .withMessage("Lecture title must be at least 3 characters"),

  check("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),

  check("subject")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject ID format"),

  validatorMiddleware,
];

// ------------------------------------------------------
// Get Lecture by ID
// ------------------------------------------------------
exports.getMyLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];

// ------------------------------------------------------
// Update Lecture
// ------------------------------------------------------
exports.updateMyLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),

  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Lecture title must be at least 3 characters"),

  check("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),

  check("subject")
    .optional()
    .isMongoId()
    .withMessage("Invalid subject ID format"),

  validatorMiddleware,
];

// ------------------------------------------------------
// Delete Lecture
// ------------------------------------------------------
exports.deleteMyLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];
