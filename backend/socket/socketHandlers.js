// socket/socketHandlers.js
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

module.exports = function registerSocketHandlers(io, socket) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      logger.warn("⚠️ No token provided in socket handshake");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Join personal room
    socket.join(userId.toString());
    logger.info(`📡 User joined personal room: ${userId}`);
    console.log("Token received:", socket.handshake.auth?.token);

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.warn(`❌ Client disconnected: ${socket.id}`);
    });
  } catch (err) {
    logger.error("❌ Socket auth failed", { error: err.message });
  }
};
