const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const router = express.Router();
const itEquipmentInfo = require("../../models/EngineeringAdmin/ITequipments");
const multer = require("multer");
const path = require("path");

//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./server/public/uploads/itEquipments",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

//initializing multer
const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

//ADD NEW ITEQUIPMENTS
router.post("/", upload.single("ITEquipmentImage"), async (req, res) => {
  try {


    // If no file uploaded, still allow creating equipment
    if (req.file) {
      req.body.ITEquipmentImage =
        "http://192.168.8.11:5000/uploads/itEquipments/" + req.file.filename;
    }

    const savedEquipment = await itEquipmentInfo.create(req.body);
    res.status(201).json(savedEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(400).json({ error: error.message });
  }
});
//ADD NEW MAINTENANCE DETAILS ON ITEQUIPMENTS
// router.post('/:id/maintenance', async (req,res)=>{
//   try {

//     const updatedEquipment = await itEquipmentInfo.findByIdAndUpdate(req.params.id, { $push: { MaintenanceDtls: req.body } }, { new: true });

//     if (!updatedEquipment) {
//       return res.status(404).json({ error: 'Equipment not found' });
//     }

//     res.json(updatedEquipment);

//   } catch (error) {
//       res.status(400).json({ error: error.message });
//   }
// });

//ADD NEW MAINTENANCE DETAILS ON ITEQUIPMENTS
router.post("/:id/maintenance", upload.single("file"), async (req, res) => {
  try {
    // Handle file upload
    if (req.file) {
      req.body.MaintenanceImage =
        "http://192.168.8.11:5000/uploads/itEquipments/" + req.file.filename;
      // return res.status(400).json({ error: 'No file uploaded.' });
    }
    const updatedITEquipment = await itEquipmentInfo.findByIdAndUpdate(
      req.params.id,
      { $push: { MaintenanceDtls: req.body } },
      { new: true }
    );

    if (!updatedITEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    res.json(updatedITEquipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//DASHBOARD
router.get("/dashboard/dash", async (req, res) => {
  try {
    const AllEquipments = await itEquipmentInfo
      .find({}, { _id: 0, EquipmentType: 1 })
      .sort({ MaintenanceDtls: 1, createdOn: 1 });
    res.json(AllEquipments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve All Office Equipments" });
  }
});

//COUNT EQUIPMENTS BY TYPE
router.get("/dashboard", async (req, res) => {
  try {
    // Use Mongoose aggregation to count EquipmentType
    const equipmentTypeCounts = await itEquipmentInfo.aggregate([
      {
        // $group stage: It groups documents by the "EquipmentType" field and calculates the count of each group using $sum.
        //The result of this stage will have documents with "_id" representing the equipment types and "count"
        //representing the count of each equipment type.
        $group: {
          _id: "$EquipmentType",
          count: { $sum: 1 },
        },
      },
      {
        //$project stage: It reshapes the output of the previous stage.
        //It renames "_id" to "EquipmentType" and excludes the "_id" field (by setting it to 0).
        //This results in a clean document structure with "EquipmentType" and "count" fields.
        $project: {
          _id: 0,
          EquipmentType: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(equipmentTypeCounts);
  } catch (error) {
    console.error("Error counting EquipmentType:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//READ ALL IT EQUIPMENTS
router.get("/", async (req, res) => {
  try {
    const AllITEquipments = await itEquipmentInfo.aggregate([
      {
        $match: { IsDeleted: { $ne: true } }, // Match documents where IsDeleted is not true
      },
      {
        $addFields: {
          MaintenanceDtls: {
            $filter: {
              input: "$MaintenanceDtls", // Specify the array to filter
              as: "maintenance", // Variable to represent each element in the array
              cond: { $ne: ["$$maintenance.IsDeleted", true] }, // Condition to include only elements where IsDeleted is not true
            },
          },
        },
      },
      {
        $sort: { "MaintenanceDtls.MaintenanceDate": 1, createdOn: 1 }, // Sort by MaintenanceDate in ascending order within the MaintenanceDtls array, then by createdOn in ascending order
      },
    ]);

    //const AllEquipments = await itEquipmentInfo.find({},{_id:0,EquipmentType:1}).sort({MaintenanceDtls : 1,createdOn : 1 });
    //const AllEquipments = await itEquipmentInfo.find({ IsDeleted: { $ne: true }},{MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1,createdOn : 1 });
    // MachineName:1,
    // EquipmentType:1,
    // PlateNo:1,
    // PropertyCustodian:1,
    // MaintenanceDtls :1,
    // MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1}
    res.json(AllITEquipments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve All Office Equipments" });
  }
});

//READ SPECIFIC IT EQUIPMENTS RECORD BY ID
router.get("/:id", async (req, res) => {
  try {
    const equipment = await itEquipmentInfo.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//READ ALL MAINTENANCE DETAILS BY SPECIFIC IT EQUIPMENT
router.get("/:id/maintenance", async (req, res) => {
  try {
    const equipment = await itEquipmentInfo.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    const equipmentdtls = equipment.MaintenanceDtls;
    const filtered = equipmentdtls.filter((details) => !details.IsDeleted);
    const sorted = filtered.sort((a, b) => b.createdOn - a.createdOn); // Sort by updatedOn in descending order
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a specific IT EQUIPMENTS record by ID
router.put("/:id", upload.single("ITEquipmentImage"), async (req, res) => {
  try {

    const existing = await itEquipmentInfo.findById(req.params.id);
    if (req.file) {
      req.body.ITEquipmentImage =
        "http://192.168.8.11:5000/uploads/itEquipments/" + req.file.filename;
    } else if (typeof req.body.ITEquipmentImage === "object" && req.body.ITEquipmentImage.__key) {
      // if frontend sends object (e.g. from <q-file>)
      req.body.ITEquipmentImage = existing.ITEquipmentImage || ""; // or keep previous image if you store it
    }



    const updatedEquipment = await itEquipmentInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//DELETE IT EQUIPMENTS
router.put("/:id/remove", async (req, res) => {
  try {
    let toDeleteITEquiptment = req.body;
    toDeleteITEquiptment.IsDeleted = true;
    // res.json( toDeleteEquiptment)
    const deletedITEquipment = await itEquipmentInfo.findByIdAndUpdate(
      req.params.id,
      toDeleteITEquiptment,
      { new: true }
    );
    if (!deletedITEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(deletedITEquipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//REMOVE MAINTENANCE DETAILS ON ITEQUIPMENTS
router.put("/:id/maintenance/remove/:cid", async (req, res) => {
  try {
    const pid = req.params.id;
    const cid = req.params.cid;

    const Equipments = await itEquipmentInfo.findById(pid);
    if (!Equipments) {
      return res.status(404).json({ error: "Personnel Record not found" });
    }

    // Find the index of the contract in the employmentDtl array
    const EquipmentsIndex = Equipments.MaintenanceDtls.findIndex(
      (sub) => sub._id == cid
    );

    if (EquipmentsIndex == -1) {
      return res.status(404).json({ error: "Contract Not Found" });
    }

    // Mark the contract as deleted
    Equipments.MaintenanceDtls[EquipmentsIndex].IsDeleted = true;

    // Save the updated personnel record
    await Equipments.save();

    res.json(Equipments.MaintenanceDtls[EquipmentsIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/perequipment", async (req, res) => {
  try {
    const AllEquipments = await itEquipmentInfo.find(
      {},
      { _id: 0, EquipmentType: 1 }
    );
    //const AllEquipments = await itEquipmentInfo.find({},{MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1,createdOn : 1 });
    // MachineName:1,
    // EquipmentType:1,
    // PlateNo:1,
    // PropertyCustodian:1,
    // MaintenanceDtls :1,
    // MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1}
    res.json(AllEquipments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve All Office Equipments" });
  }
});

module.exports = router;
