const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "lecture:new",
        "lecture:update",
        "lecture:delete",
        "subject:new",
        "quiz:new",
        "student:joined",
        "student:left",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    payload: {
      type: Object,
      default: {},
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
