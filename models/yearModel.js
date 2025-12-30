const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "year name required"],
    },
    code: {
      type: String,
      unique: [true, "year code must be unique"],
    },
    description: String,

    semesters: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Semester",
      },
    ],

    subjects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { timestamps: true }
);

const Year = mongoose.model("Year", yearSchema);

module.exports = Year;
