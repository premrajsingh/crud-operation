const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeesRouter = require("./server/routes/employees");

const app = express();
const PORT = process.env.PORT || 5000;

// TODO: replace this with your own MongoDB connection string
// For example, from MongoDB Atlas:
// mongodb+srv://<username>:<password>@cluster0.mongodb.net/employee_crud
const MONGODB_URI = "mongodb+srv://singhpremraj264_db_user:TG3HmiEKxGBvjdK8@cluster0.vst3j0k.mongodb.net/employee_crud?retryWrites=true&w=majority&appName=Cluster0";
// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" })); // allow base64 profile images

// Routes
app.use("/api/employees", employeesRouter);

// Health check
app.get("/", (_req, res) => {
  res.send("Employee CRUD API is running");
});

// Start server after connecting DB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err.message);
    process.exit(1);
  });


