// socket/notificationHandlers.js
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

module.exports = function registerNotificationHandlers(io, socket) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      logger.warn("⚠️ No token provided in socket handshake");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    socket.join(userId.toString());
    logger.info(`📡 User joined personal room: ${userId}`);
  } catch (err) {
    logger.error("❌ Socket auth failed", { error: err.message });
  }
};
