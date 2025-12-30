const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name required"],
    },
    code: {
      type: String,
      unique: [true, "subject code must be unique"],
    },
    yearId: {
      type: mongoose.Schema.ObjectId,
      ref: "Year",
      required: [true, "yearId required"],
    },
    semesterId: {
      type: mongoose.Schema.ObjectId,
      ref: "Semester",
      required: [true, "semesterId required"],
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "doctorId required"],
    },
    description: String,
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
