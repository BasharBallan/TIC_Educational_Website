const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    // Group name (e.g., "Cardiology Study Group")
    name: {
      type: String,
      required: true
    },

    // Doctor who created the group
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', required: true
    },

    // Students who joined the group
    members: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],

    // Invitation link for joining the group
    inviteLink: {
      type: String
    },

    // Messages inside the group
    messages: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    }],

    // Quizzes created inside the group
    quizzes: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    }],
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
