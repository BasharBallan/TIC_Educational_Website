const fs = require("fs");
const path = require("path");
require("colors");
const dotenv = require("dotenv");

const Lecture = require("../../models/lectureModel");
const Subject = require("../../models/subjectModel");
const User = require("../../models/userModel");

const dbConnection = require("../../config/database");

dotenv.config({ path: path.join(__dirname, "../../config.env") });

// Connect DB
dbConnection();

// Read lectures.json
const lectures = JSON.parse(
  fs.readFileSync(path.join(__dirname, "lectures.json"))
);

const insertData = async () => {
  try {
    const inserted = await Lecture.create(lectures);

    console.log("Lectures Inserted".green.inverse);

    // Update Subject + Doctor relations
    for (const lec of inserted) {
      await Subject.findByIdAndUpdate(lec.subjectId, {
        $push: { lectures: lec._id }
      });

      await User.findByIdAndUpdate(lec.doctorId, {
        $push: { "doctorData.lectures": lec._id }
      });
    }

    console.log("\n===== Inserted Lectures =====\n".cyan);

    inserted.forEach((lec, i) => {
      console.log(`\n#${i + 1} ------------------------------`.yellow);
      console.log(`ID: ${lec._id}`);
      console.log(`Title: ${lec.title}`);
      console.log(`Subject: ${lec.subjectId}`);
      console.log(`Doctor: ${lec.doctorId}`);
      console.log(`Description: ${lec.description}`);
      console.log("--------------------------------------------------".yellow);
    });

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Lecture.deleteMany({});
    console.log("Lectures Deleted".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") insertData();
else if (process.argv[2] === "-d") destroyData();
else {
  console.log("Use -i to insert or -d to delete".yellow);
  process.exit();
}
