const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const router = express.Router();
const ProjectInfo = require('../../models/EngineeringAdmin/ProjectInfo');
const multer = require("multer");
const path = require("path");





//Setting storage engine
const storageEngine = multer.diskStorage({
  destination: "./server/public/uploads/EngineeringProjects",
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


//ADD NEW EQUIPMENTS
router.post('/', async (req,res)=>{
  try {
     
      const NewProject = await ProjectInfo.create(req.body)
      res.status(201).json(NewProject);
      
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});


//READ ALL PROJECT
router.get('/', async (req, res) => {
    try {
      const AllProjects = await ProjectInfo.aggregate([
        {
            $match: { IsDeleted: { $ne: true } } // Match documents where IsDeleted is not true
        },
        {
            $addFields: {
              ProjectUpdates: {
                    $filter: {
                        input: "$ProjectUpdates", // Specify the array to filter
                        as: "projects", // Variable to represent each element in the array
                        cond: { $ne: ["$$projects.IsDeleted", true] } // Condition to include only elements where IsDeleted is not true
                    }
                }
            }
        },
        {
            $sort: { "ProjectUpdates.DateUpdate": 1, createdOn: 1 } // Sort by MaintenanceDate in ascending order within the MaintenanceDtls array, then by createdOn in ascending order
        }
    ]);

  
        // const AllProjects = await ProjectInfo.find({}).sort({createdOn : 1 });
        // MachineName:1,
        // EquipmentType:1,
        // PlateNo:1,
        // PropertyCustodian:1,
        // MaintenanceDtls :1,
        // MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1}
        res.json(AllProjects)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Office Equipments' });
    }
});

//READ SPECIFIC PROJECT RECORD BY ID
router.get('/:id', async (req, res) => {
    try {
      const GetProject = await ProjectInfo.findById(req.params.id);
      if (!GetProject) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(GetProject);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

//READ ALL MAINTENANCE DETAILS BY SPECIFIC IT EQUIPMENT
router.get('/:id/Updates', async (req, res) => {
  try {
    const projects = await ProjectInfo.findById(req.params.id);
    
    if (!projects) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const projUpdts = projects.ProjectUpdates;

    const filtered = projUpdts.filter(details=>!details.IsDeleted)
    const sorted = filtered.sort((a, b) => b.createdOn - a.createdOn); // Sort by updatedOn in descending order
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a specific PROJECT record by ID
router.put('/:id/update', async (req,res)=>{
  try {
 
      const Project = await ProjectInfo.findByIdAndUpdate(req.params.id,
        req.body,
        { new: true });

      if (!Project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(Project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});



//ADD NEW UPDATE DETAILS ON PROJECTS
router.post('/:id/projectupdate', upload.single('file'), async (req,res)=>{
  try {
      // Handle file upload
      if (req.file) {
        req.body.ImageUpdate =  'http://10.0.1.23:5000/uploads/EngineeringProjects/' + req.file.filename
      }

    //req.body.ImageUpdate = req.file.path ;
   
    const updatedProject = await ProjectInfo.findByIdAndUpdate(req.params.id, { $push: { ProjectUpdates: req.body } }, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ error: 'Unable to Update' });
    }

    res.json(updatedProject);
      
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});


//DELETE PROJECT
router.put('/:id/remove', async (req,res)=>{
  try {
   let deleted = req.body;
  deleted.IsDeleted = true;

      const deletedProject = await ProjectInfo.findByIdAndUpdate(req.params.id,
        deleted,
        { new: true });
      if (!deletedProject) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(deletedProject);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});


//REMOVE MAINTENANCE DETAILS ON ITEQUIPMENTS
router.put('/:id/updates/remove/:pid', async (req,res)=>{
  try {
    const id = req.params.id;
    const pid = req.params.pid;
   
    const Projects = await ProjectInfo.findById(id);
    if (!Projects){
      return res.status(404).json({ error: 'Personnel Record not found' });
    }
 
    // Find the index of the contract in the ProjectUpdates array
    const ProjectUpdatesIndex = Projects.ProjectUpdates.findIndex(sub => sub._id == pid);
  
    if (ProjectUpdatesIndex == -1) {
      return res.status(404).json({ error: 'Project Updates Not Found' });
    }
  
    // Mark the ProjectUpdates as deleted
    Projects.ProjectUpdates[ProjectUpdatesIndex].IsDeleted = true;
  
    // Save the updated personnel record
    await Projects.save();
  
    res.json(Projects.ProjectUpdates[ProjectUpdatesIndex]);
  
  } catch (error) {
    res.status(500).json({error:error.message})
  }
  
  });




module.exports = router