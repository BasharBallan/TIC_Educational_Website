const Notification = require("../models/notificationModel");

exports.sendNotification = async (io, userId, type, message, payload = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    message,
    payload,
  });

  io.to(userId.toString()).emit("notification:new", {
    _id: notification._id,
    type,
    message,
    payload,
    createdAt: notification.createdAt,
  });

  return notification;
};
