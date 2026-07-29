const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");


// ------------------------------------------------------
// Get Lecture by ID
// ------------------------------------------------------
exports.getLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];



// ------------------------------------------------------
// Delete Lecture
// ------------------------------------------------------
exports.deleteLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID format"),
  validatorMiddleware,
];
