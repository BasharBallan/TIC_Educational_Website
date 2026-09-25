const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // User who sent the message
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', required: true
    },

    // Message type (text, image, file, video, quiz)
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'video', 'quiz'],
      default: 'text',
    },

    // Message content or file link
    content: {
      type: String
    },
    fileUrl: {
      type: String
    },

    // Quiz reference if the message is a quiz
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },

    // Conversation reference (for private chat)
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation'
    },

    // Group reference (for group chat)
    group: {
      type: mongoose.Schema.ObjectId,
      ref: 'Group'
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
