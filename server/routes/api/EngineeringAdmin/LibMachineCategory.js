const express = require("express");
const mongodb = require("mongodb");
const router = express.Router();
const MachineCatergoryModel = require("../../models/EngineeringAdmin/Libraries/LibMachineCategory");

//CREATE NEW MACHINE CATEGORY
router.post("/new", async (req, res) => {
  const { category } = req.body;
  try {
    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Category is required" });
    }

    const existing = await MachineCatergoryModel.findOne({
      category: { $regex: new RegExp(`^${category.trim()}$`, "i") },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: `Category "${category}" already exists` });
    }

    const newCategory = await MachineCatergoryModel.create({
      ...req.body,
      category: category.trim(),
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
    try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Category is required" });
    }

    const existing = await MachineCatergoryModel.findOne({
      category: { $regex: new RegExp(`^${category.trim()}$`, "i") },
      _id: { $ne: req.params.id }, // exclude the current document
    });

    if (existing) {
      return res.status(409).json({ error: `Category "${category}" already exists` });
    }

    const updated = await MachineCatergoryModel.findByIdAndUpdate(
      req.params.id,
      { category: category.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//RETRIEVE ALL
router.get("/list", async (req, res) => {
    try {
    const categories = await MachineCatergoryModel.find().sort({ createdOn: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//RETRIEVE SPECIFIC
router.get("/:id", async (req, res) => {

     try {
    const category = await MachineCatergoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// DELETE
router.delete("remove/:id", async (req, res) => { 
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Category is required" });
    }

    const existing = await MachineCatergoryModel.findOne({
      category: { $regex: new RegExp(`^${category.trim()}$`, "i") },
      _id: { $ne: req.params.id }, // exclude the current document
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: `Category "${category}" already exists` });
    }

    const updated = await MachineCatergoryModel.findByIdAndUpdate(
      req.params.id,
      { category: category.trim() },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
