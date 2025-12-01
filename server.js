const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const employeesRouter = require("./server/routes/employees");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection - use environment variable in production, fallback to hardcoded for local dev
const MONGODB_URI = process.env.MONGODB_URI ||
  "mongodb+srv://singhpremraj264_db_user:TG3HmiEKxGBvjdK8@cluster0.vst3j0k.mongodb.net/employee_crud?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve static frontend files (IMPORTANT)
app.use(express.static(__dirname));

// API Routes
app.use("/api/employees", employeesRouter);

// Serve index.html on root
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server only after DB connects
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB");
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });
