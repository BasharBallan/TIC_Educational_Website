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

    file: {
      url: { type: String },
      type: { type: String }
    },

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

// ------------------------------------------------------
// VIRTUAL POPULATE (Fix for getMyLectures)
// ------------------------------------------------------
lectureSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectId",
  foreignField: "_id",
  justOne: true,
});

// Enable virtuals in output
lectureSchema.set("toJSON", { virtuals: true });
lectureSchema.set("toObject", { virtuals: true });

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
