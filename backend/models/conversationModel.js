const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Participants in the conversation (student and doctor)
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', required: true
      }
    ],

    // Messages linked to this conversation
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
      }
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
