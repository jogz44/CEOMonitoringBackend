const express = require("express");
const mongodb = require("mongodb");
const router = express.Router();
const EquipmentTypeModel = require("../../models/EngineeringAdmin/Libraries/LibITequipments");

router.post("/new", async (req, res) => {
  try {
     const { equipment } = req.body;
 
     if (!equipment || !equipment.trim()) {
       return res.status(400).json({ error: "IT Equiment Type is required" });
     }
 
     const existing = await EquipmentTypeModel.findOne({
       equipment: { $regex: new RegExp(`^${equipment.trim()}$`, "i") },
     });
 
     if (existing) {
       return res.status(409).json({ error: `Equipment Type "${equipment}" already exists` });
     }
 
     const newITEquipmentType = await EquipmentTypeModel.create({
       ...req.body,
       equipment: equipment.trim(),
     });
     res.status(201).json(newITEquipmentType);
   } catch (error) {
     res.status(500).json({ error: error.message });
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
router.get("/list", async (req, res) => {
 try {
     const EquipmentType = await EquipmentTypeModel.find().sort({ createdOn: -1 });
     res.status(200).json(EquipmentType);
   } catch (error) {
     res.status(500).json({ error: error.message });
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

router.delete("/remove/:id", async (req, res) => {
      try {
            const EquipmentType = await EquipmentTypeModel.findByIdAndDelete(req.params.id);
            if (!EquipmentType) {
              return res.status(404).json({ error: 'Equipment not found' });
            }
            res.status(200).json(EquipmentType);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
});

module.exports = router;
