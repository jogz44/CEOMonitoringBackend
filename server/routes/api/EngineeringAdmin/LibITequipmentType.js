const express = require("express");
const mongodb = require("mongodb");
const router = express.Router();
const EquipmentTypeModel = require("../../models/EngineeringAdmin/Libraries/LibITequipments");

router.post("/", async (req, res) => {
  try {
    const EquipmentType = await EquipmentTypeModel.create(req.body);

    if (!EquipmentType) {
      return res.status(204).json({ error: error.message });
    }
    res.status(201).json(EquipmentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//UPDATE EQUIPMENT TYPE
router.post("/:id", async (req, res) => {
  try {
    const EquipmentType = await EquipmentTypeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!EquipmentType) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    res.status(200).json(EquipmentType);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//RETRIEVE ALL EQUIPMENT TYPE
router.get("/", async (req, res) => {
  try {
    const EquipmentType = await EquipmentTypeModel.find({});
    if (!EquipmentType) {
      return res.status(404).json("List Not Found or List is Empty");
    }
    res.status(200).json(EquipmentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {

    try{
            const EquipmentType = await EquipmentTypeModel.findById(req.params.id)
            
            if (!EquipmentType){
             return  res.status(404).json('Type Not Found');
            }
            else {
                res.status(201).json(EquipmentType);
            }
        }
        catch (error)
        {
            res.status(500).json({ error: error.message });
        }
});

router.post("/:id", async (req, res) => {
      try {
            const EquipmentType = await EquipmentTypeModel.findByIdAndRemove(req.params.id);
            if (!EquipmentType) {
              return res.status(404).json({ error: 'Equipment not found' });
            }
            res.status(200).json(EquipmentType);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
});

module.exports = router;
