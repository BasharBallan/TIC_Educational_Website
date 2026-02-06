const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// ------------------------------------------------------
// Create Subject
// ------------------------------------------------------
exports.createSubjectValidator = [
  check("name")
    .notEmpty()
    .withMessage("Subject name is required")
    .isLength({ min: 3 })
    .withMessage("Subject name must be at least 3 characters"),

  check("code")
    .notEmpty()
    .withMessage("Subject code is required")
    .isLength({ min: 2 })
    .withMessage("Subject code must be at least 2 characters"),

  check("yearId")
    .notEmpty()
    .withMessage("yearId is required")
    .isMongoId()
    .withMessage("Invalid yearId format"),

  check("semesterId")
    .notEmpty()
    .withMessage("semesterId is required")
    .isMongoId()
    .withMessage("Invalid semesterId format"),

  check("doctorId")
    .notEmpty()
    .withMessage("doctorId is required")
    .isMongoId()
    .withMessage("Invalid doctorId format"),

  check("description").optional(),

  validatorMiddleware,
];

// ------------------------------------------------------
// Get Subject by ID
// ------------------------------------------------------
exports.getSubjectValidator = [
  check("id").isMongoId().withMessage("Invalid subject ID format"),
  validatorMiddleware,
];

// ------------------------------------------------------
// Update Subject
// ------------------------------------------------------
exports.updateSubjectValidator = [
  check("id").isMongoId().withMessage("Invalid subject ID format"),

  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Subject name must be at least 3 characters"),

  check("code")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Subject code must be at least 2 characters"),

  check("yearId")
    .optional()
    .isMongoId()
    .withMessage("Invalid yearId format"),

  check("semesterId")
    .optional()
    .isMongoId()
    .withMessage("Invalid semesterId format"),

  check("doctorId")
    .optional()
    .isMongoId()
    .withMessage("Invalid doctorId format"),

  check("description").optional(),

  validatorMiddleware,
];

// ------------------------------------------------------
// Delete Subject
// ------------------------------------------------------
exports.deleteSubjectValidator = [
  check("id").isMongoId().withMessage("Invalid subject ID format"),
  validatorMiddleware,
];
