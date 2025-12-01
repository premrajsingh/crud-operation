const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

// GET /api/employees - list all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch employees", error: err.message });
  }
});

// POST /api/employees - create employee
router.post("/", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Failed to create employee", error: err.message });
  }
});

// PUT /api/employees/:id - update employee
router.put("/:id", async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update employee", error: err.message });
  }
});

// DELETE /api/employees/:id - delete single employee
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee", error: err.message });
  }
});

// DELETE /api/employees - delete all employees
router.delete("/", async (_req, res) => {
  try {
    await Employee.deleteMany({});
    res.json({ message: "All employees deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employees", error: err.message });
  }
});

module.exports = router;


