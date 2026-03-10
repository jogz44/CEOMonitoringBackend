const express= require('express');
const mongodb = require('mongodb');
const router = express.Router();
const MachineTypeModel = require('../../models/EngineeringAdmin/Libraries/LibMachineType');

// CREATE
router.post("/", async (req, res) => {
  try {
    const { MachineType } = req.body;

    if (!MachineType || !MachineType.trim()) {
      return res.status(400).json({ error: "Machine Type is required" });
    }

    const existing = await MachineTypeModel.findOne({
      MachineType: { $regex: new RegExp(`^${MachineType.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({ error: `Machine Type "${MachineType}" already exists` });
    }

    const newMachineType = await MachineTypeModel.create({
      ...req.body,
      MachineType: MachineType.trim(),
    });
    res.status(201).json(newMachineType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const machineTypes = await MachineTypeModel.find().sort({ createdOn: -1 });
    res.status(200).json(machineTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const machineType = await MachineTypeModel.findById(req.params.id);

    if (!machineType) {
      return res.status(404).json({ error: "Machine Type not found" });
    }

    res.status(200).json(machineType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { MachineType } = req.body;

    if (!MachineType || !MachineType.trim()) {
      return res.status(400).json({ error: "Machine Type is required" });
    }

    const existing = await MachineTypeModel.findOne({
      MachineType: { $regex: new RegExp(`^${MachineType.trim()}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({ error: `Machine Type "${MachineType}" already exists` });
    }

    const updated = await MachineTypeModel.findByIdAndUpdate(
      req.params.id,
      { MachineType: MachineType.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Machine Type not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MachineTypeModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Machine Type not found" });
    }

    res.status(200).json({ message: "Machine Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports= router;