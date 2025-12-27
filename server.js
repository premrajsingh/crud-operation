const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const employeesRouter = require("./server/routes/employees");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection - use environment variable in production, fallback to hardcoded for local dev
// Remove quotes if present (Render sometimes adds them)
let MONGODB_URI = process.env.MONGODB_URI || 
  "mongodb+srv://singhpremraj264_db_user:VdQpMMrtU5zi5YaP@cluster0.3zdgegx.mongodb.net/employee_crud?retryWrites=true&w=majority&appName=Cluster0";

// Clean up the URI (remove quotes if accidentally included)
MONGODB_URI = MONGODB_URI.trim().replace(/^["']|["']$/g, '');

console.log("🔗 MongoDB URI configured:", MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve static frontend files (IMPORTANT)
app.use(express.static(__dirname));

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  res.json({
    status: "ok",
    database: states[dbStatus] || "unknown",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/employees", employeesRouter);

// Serve index.html on root
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// MongoDB connection event handlers
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

// Start server only after DB connects
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("📊 Database:", mongoose.connection.name);
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Full error:", err);
    process.exit(1);
  });
