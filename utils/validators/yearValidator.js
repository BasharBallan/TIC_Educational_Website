const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// ------------------------------------------------------
// Get Year by ID
// ------------------------------------------------------
exports.getYearValidator = [
  check("id").isMongoId().withMessage("Invalid year ID format"),
  validatorMiddleware,
];


