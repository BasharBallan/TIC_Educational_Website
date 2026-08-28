const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const getMessage = require("../utils/getMessage");

const Notification = require("../models/notificationModel");


// ======================================================================
// GET ALL NOTIFICATIONS
// ======================================================================
// @desc    Get all notifications for logged-in user
// @route   GET /api/v1/notifications
// @access  Private/User
// ======================================================================
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: getMessage("notifications_list", req.lang),
    results: notifications.length,
    data: notifications,
  });
});


// ======================================================================
// GET UNREAD COUNT
// ======================================================================
// @desc    Get unread notifications count
// @route   GET /api/v1/notifications/unread-count
// @access  Private/User
// ======================================================================
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.status(200).json({
    status: "success",
    message: getMessage("notifications_unread_count", req.lang),
    count,
  });
});


// ======================================================================
// MARK ONE AS READ
// ======================================================================
// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private/User
// ======================================================================
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new ApiError(getMessage("not_found", req.lang), 404));
  }

  res.status(200).json({
    status: "success",
    message: getMessage("notification_read", req.lang),
    data: notification,
  });
});


// ======================================================================
// MARK ALL AS READ
// ======================================================================
// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private/User
// ======================================================================
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id },
    { read: true }
  );

  res.status(200).json({
    status: "success",
    message: getMessage("notifications_all_read", req.lang),
  });
});


// ======================================================================
// DELETE ONE
// ======================================================================
// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private/User
// ======================================================================
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    return next(new ApiError(getMessage("not_found", req.lang), 404));
  }

  res.status(200).json({
    status: "success",
    message: getMessage("notification_deleted", req.lang),
  });
});


// ======================================================================
// DELETE ALL
// ======================================================================
// @desc    Delete all notifications
// @route   DELETE /api/v1/notifications
// @access  Private/User
// ======================================================================
exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });

  res.status(200).json({
    status: "success",
    message: getMessage("notifications_all_deleted", req.lang),
  });
});
