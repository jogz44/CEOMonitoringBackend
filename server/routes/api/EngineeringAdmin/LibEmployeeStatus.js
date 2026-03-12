const express = require("express");
const router = express.Router();
const LibEmployeeStatusModel = require("../../models/EngineeringAdmin/Libraries/LibEmployeeStatus");

// CREATE
router.post("/new", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !status.trim()) {
      return res.status(400).json({ error: "Status is required" });
    }

    const existing = await LibEmployeeStatusModel.findOne({
      status: { $regex: new RegExp(`^${status.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({ error: `Status "${status}" already exists` });
    }

    const newStatus = await LibEmployeeStatusModel.create({
      ...req.body,
      status: status.trim(),
    });
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL
router.get("/list", async (req, res) => {
  try {
    const statuses = await LibEmployeeStatusModel.find().sort({ createdOn: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const status = await LibEmployeeStatusModel.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !status.trim()) {
      return res.status(400).json({ error: "Status is required" });
    }

    const existing = await LibEmployeeStatusModel.findOne({
      status: { $regex: new RegExp(`^${status.trim()}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({ error: `Status "${status}" already exists` });
    }

    const updated = await LibEmployeeStatusModel.findByIdAndUpdate(
      req.params.id,
      { status: status.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
router.delete("/remove/:id", async (req, res) => {
  try {
    const deleted = await LibEmployeeStatusModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;