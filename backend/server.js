// server.js

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const logger = require("./utils/logger");
const { initSocketServer } = require("./socket/socket");

// ------------------------------------------------------
// Load environment variables
// ------------------------------------------------------
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "config.env.test" });
  logger.transports.forEach((t) => (t.silent = true));
} else {
  dotenv.config({ path: "config.env" });
}

// ------------------------------------------------------
// Connect to MongoDB
// ------------------------------------------------------
mongoose
  .connect(process.env.DB_URI)
  .then(() => logger.info("📦 MongoDB connected successfully"))
  .catch((err) => {
    logger.error(`❌ DB connection error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  });

// ------------------------------------------------------
// Create raw HTTP server
// ------------------------------------------------------
const httpServer = http.createServer(app);

// ------------------------------------------------------
// Initialize Socket.IO
// ------------------------------------------------------
const io = initSocketServer(httpServer);
global.io = io;

// ------------------------------------------------------
// Inject io into every request (Fix req.io.emit)
// ------------------------------------------------------
app.use((req, res, next) => {
  req.io = io; // attach io instance globally
  next();
});

// ------------------------------------------------------
// Start server
// ------------------------------------------------------
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server + Socket.IO running on port ${PORT}`);
});

// ------------------------------------------------------
// Handle unhandled promise rejections
// ------------------------------------------------------
process.on("unhandledRejection", (err) => {
  logger.error(`💥 UnhandledRejection: ${err.name} | ${err.message}`, {
    stack: err.stack,
  });

  httpServer.close(() => {
    logger.error("🔻 Server shutting down due to unhandled rejection...");
    process.exit(1);
  });
});

// ------------------------------------------------------
// Handle uncaught exceptions
// ------------------------------------------------------
process.on("uncaughtException", (err) => {
  logger.error(`💥 UncaughtException: ${err.name} | ${err.message}`, {
    stack: err.stack,
  });

  httpServer.close(() => {
    logger.error("🔻 Server shutting down due to uncaught exception...");
    process.exit(1);
  });
});
