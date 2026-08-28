const Year = require("../../models/yearModel");
const dotenv = require("dotenv");
const Semester = require("../../models/semesterModel");
const dbConnection = require("../../config/database");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../config.env") });

// Connect DB
dbConnection();

(async () => {
  const semesters = await Semester.find();

  for (const sem of semesters) {
    await Year.findByIdAndUpdate(sem.yearId, {
      $push: { semesters: sem._id }
    });
  }

  console.log("Years updated with semesters");
  process.exit();
})();
