const fs = require("fs");
const path = require("path");
require("colors");
const dotenv = require("dotenv");
const Subject = require("../../models/subjectModel");
const dbConnection = require("../../config/database");

dotenv.config({ path: path.join(__dirname, "../../config.env") });

// Connect DB
dbConnection();

// Read JSON file
const doctors = JSON.parse(
  fs.readFileSync(path.join(__dirname, "subjects.json"))
);

// Insert
const insertData = async () => {
  try {
    await Subject.create(doctors);
    console.log("subjects Inserted".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Delete
const destroyData = async () => {
  try {
    await Subject.deleteMany({});
    console.log("subjects Deleted".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Run
if (process.argv[2] === "-i") insertData();
else if (process.argv[2] === "-d") destroyData();
else {
  console.log("Use -i to insert or -d to delete".yellow);
  process.exit();
}
