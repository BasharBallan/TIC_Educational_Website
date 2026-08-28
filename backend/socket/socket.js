// socket/socket.js
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");
const logger = require("../utils/logger");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`🔥 Client connected: ${socket.id}`);
    registerSocketHandlers(io, socket);
  });

  logger.info("⚡ Socket.IO initialized");
  return io;
}

module.exports = { initSocketServer };
