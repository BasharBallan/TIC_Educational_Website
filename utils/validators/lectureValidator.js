const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// ------------------------------------------------------
// Create Lecture (Admin)
// ------------------------------------------------------
exports.createLectureValidator = [
  check("title")
    .notEmpty()
    .withMessage("Lecture title is required")
    .isLength({ min: 3 })
    .withMessage("Lecture title must be at least 3 characters"),

  check("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),

  check("subjectId")
    .notEmpty()
    .withMessage("subjectId is required")
    .isMongoId()
    .withMessage("Invalid subjectId format"),

  check("doctorId")
    .notEmpty()
    .withMessage("doctorId is required")
    .isMongoId()
    .withMessage("Invalid doctorId format"),

  // Quiz validation (optional)
  body("quiz")
    .optional()
    .isArray()
    .withMessage("Quiz must be an array"),

  body("quiz.*.question")
    .optional()
    .notEmpty()
    .withMessage("Quiz question is required"),

  body("quiz.*.choices")
    .optional()
    .isArray()
    .withMessage("Choices must be an array"),

  body("quiz.*.correctAnswerIndex")
    .optional()
    .isInt()
    .withMessage("correctAnswerIndex must be a number"),

  validatorMiddleware,
];

// ------------------------------------------------------
// Get Lecture by ID
// ------------------------------------------------------
exports.getLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];

// ------------------------------------------------------
// Update Lecture (Admin)
// ------------------------------------------------------
exports.updateLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),

  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Lecture title must be at least 3 characters"),

  check("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),

  check("subjectId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subjectId format"),

  check("doctorId")
    .optional()
    .isMongoId()
    .withMessage("Invalid doctorId format"),

  body("quiz")
    .optional()
    .isArray()
    .withMessage("Quiz must be an array"),

  body("quiz.*.question")
    .optional()
    .notEmpty()
    .withMessage("Quiz question is required"),

  body("quiz.*.choices")
    .optional()
    .isArray()
    .withMessage("Choices must be an array"),

  body("quiz.*.correctAnswerIndex")
    .optional()
    .isInt()
    .withMessage("correctAnswerIndex must be a number"),

  validatorMiddleware,
];

// ------------------------------------------------------
// Delete Lecture
// ------------------------------------------------------
exports.deleteLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];
