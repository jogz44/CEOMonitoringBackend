const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const router = express.Router();
const EquipmentInfo = require("../../models/EngineeringAdmin/EquipmentInfo");
const multer = require("multer");
const path = require("path");

//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./server/public/uploads/equipments",
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

// router.post("/upload", upload.single("image"),(req,res)=>{

// if(req.file){

//   const filePath = req.file.path;
//   res.send(`Image Uploaded Successfully. Path ${filePath}`)

// }else {
//   res.status(400).send("No Image Uploaded or invalid Image Format")
// }
// });

//ADD NEW EQUIPMENTS
router.post("/", upload.array("EquipmentImage", 3), async (req, res) => {
  try {
    if (req.files && req.files.length > 0) {
      //  req.body.EquipmentImage =  `http://${process.env.express_host}:${process.env.express_port}/uploads/equipments/` + req.file.filename ;
      req.body.EquipmentImage = req.files.map(
        (file) =>
          `http://${process.env.express_host}:${process.env.express_port}/uploads/equipments/` +
          file.filename,
      );
    }

    const savedEquipment = await EquipmentInfo.create(req.body);
    res.status(201).json(savedEquipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// //ADD NEW MAINTENANCE DETAILS ON EQUIPMENTS
// router.post('/:id/maintenance', async (req,res)=>{
//   try {

//     const updatedEquipment = await EquipmentInfo.findByIdAndUpdate(req.params.id, { $push: { MaintenanceDtls: req.body } }, { new: true });

//     if (!updatedEquipment) {
//       return res.status(404).json({ error: 'Equipment not found' });
//     }

//     res.json(updatedEquipment);

//   } catch (error) {
//       res.status(400).json({ error: error.message });
//   }
// });

//ADD NEW MAINTENANCE DETAILS ON EQUIPMENTS
router.post(
  "/:id/maintenance",
  upload.single("MaintenanceImageProof"),
  async (req, res) => {
    try {
      // Handle file upload

      const newMaintenance = {
        MaintenanceType: req.body.MaintenanceType,
        MaintenanceDate: req.body.MaintenanceDate,
        MaintenanceDesc: req.body.MaintenanceDesc,
        MaintenanceImageProof: req.file
          ? `http://${process.env.express_host}:${process.env.express_port}/uploads/equipments/` +
            req.file.filename
          : "",
      };

      const updatedEquipment = await EquipmentInfo.findByIdAndUpdate(
        req.params.id,
        { $push: { MaintenanceDtls: newMaintenance } },
        { new: true },
      );

      if (!updatedEquipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      res.json(updatedEquipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

//REMOVE MAINTENANCE DETAILS ON EQUIPMENTS
router.delete("/:id/maintenance/:mid", async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const maintenanceId = req.params.mid;

    const updatedEquipment = await EquipmentInfo.findOneAndUpdate(
      { _id: equipmentId },
      { $pull: { MaintenanceDtls: { _id: maintenanceId } } },
      { new: true },
    );

    if (!updatedEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    // res.status(200).send.json('Maintenance Info Deleted.');
    res.json("Deleted Successfully!");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//READ ALL EQUIPMENTS
router.get("/", async (req, res) => {
  try {
    const AllEquipments = await EquipmentInfo.aggregate([
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

    // const AllEquipments = await EquipmentInfo.find({ IsDeleted: { $ne: true }},{MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1,createdOn : 1 });
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

//READ SPECIFIC EQUIPMENT RECORD BY ID
router.get("/:id", async (req, res) => {
  try {
    const equipment = await EquipmentInfo.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//READ ALL MAINTENANCE OF SPECIFIC EQUIPMENT
router.get("/:id/maintenance", async (req, res) => {
  try {
    const equipment = await EquipmentInfo.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    const equipmentdtls = equipment.MaintenanceDtls;
    const filteredDtls = equipmentdtls.filter((details) => !details.IsDeleted);
    const sorted = filteredDtls.sort((a, b) => b.createdOn - a.createdOn); // Sort by updatedOn in descending order

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a specific equipment record by ID
router.put("/:id", upload.array("EquipmentImage",3), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // If a new file is uploaded, update the EquipmentImage field
    if (req.files && req.files.length > 0) {
       updatedData.EquipmentImage = req.files.map(
        file => `http://${process.env.express_host}:${process.env.express_port}/uploads/equipments/` +
         file.filename
       );
    }

    // Perform the update

    if ("MaintenanceDtls" in updatedData) {
      delete updatedData.MaintenanceDtls; // Remove MaintenanceDtls from updatedData
    }
    const updatedEquipment = await EquipmentInfo.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true, // return updated document
      },
    );

    if (!updatedEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    res.json(updatedEquipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ error: error.message });
  }
});

//DELETE EQUIPMENTS
router.put("/remove/:id", async (req, res) => {
  try {
    let toDeleteEquiptment = req.body;
    toDeleteEquiptment.IsDeleted = true;
    // res.json( toDeleteEquiptment)
    const deletedEquipment = await EquipmentInfo.findByIdAndUpdate(
      req.params.id,
      toDeleteEquiptment,
      { new: true },
    );
    if (!deletedEquipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(deletedEquipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//remove maintenance history
router.put("/:id/maintenance/remove/:cid", async (req, res) => {
  try {
    const pid = req.params.id;
    const cid = req.params.cid;
    // let forDelete = req.body;

    // forDelete.IsDeleted = true;

    // console.log("delete record=",req.body)

    const Equipments = await EquipmentInfo.findById(pid);
    if (!Equipments) {
      return res.status(404).json({ error: "Personnel Record not found" });
    }
    // const ContractRecordToDelete = PersonnelRecord.employmentDtl.findByIdAndUpdate(sub => sub._id == cid,{ $push: { employmentDtl: forDelete } },{new:true})
    // if (!ContractRecordToDelete){
    //   return res.status(404).json({ error: 'Unable to Update, Contract Not Found' });
    // }
    // res.json(ContractRecordToDelete);

    // Find the index of the contract in the employmentDtl array
    const EquipmentsIndex = Equipments.MaintenanceDtls.findIndex(
      (sub) => sub._id == cid,
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

module.exports = router;
