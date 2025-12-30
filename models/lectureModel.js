const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title required"],
    },
    description: String,
    subjectId: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
      required: [true, "subjectId required"],
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "doctorId required"],
    },
    fileUrl: String,
    content: String,
    quiz: [
      {
        question: {
          type: String,
          required: [true, "question required"],
        },
        choices: [String],
        correctAnswerIndex: Number,
      },
    ],
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
