const mongoose = require("mongoose");
const app = require("../app");

let connectionPromise;

function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connectionPromise) {
    if (!process.env.DB_URI) {
      return Promise.reject(new Error("DB_URI is not configured"));
    }

    connectionPromise = mongoose.connect(process.env.DB_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      status: "error",
      message: "Database unavailable",
    });
  }
};
