const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    // Quiz question
    question: {
      type: String,
      required: true
    },

    // Options for the quiz
    options: [{
      type: String,
      required: true
    }],

    // Correct answer index
    correctAnswer: {
      type: Number
    },

    // Doctor who created the quiz
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },

    // Group where the quiz belongs
    group: {
      type: mongoose.Schema.ObjectId,
      ref: 'Group',
      required: true
    },

    // Student answers
    answers: [
      {
        student: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        optionIndex: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
