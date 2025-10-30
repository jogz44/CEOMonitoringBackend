
const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const router = express.Router();
const personInfo = require('../../models/EngineeringAdmin/PersonnelInfo');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
require('dotenv').config();


const MonggoConn = `mongodb://${process.env.db_host}:${process.env.db_port}/${process.env.db_name}`;
// mongoose.connect(MonggoConn, { useNewUrlParser: true, useUnifiedTopology: true, });

// Init gfs
let gfs;
const Conn = mongoose.createConnection(MonggoConn);
Conn.once('open', ()=>{
    gfs = Grid(Conn.db,mongoose.mongo);
    gfs.collection('personnelinfos');
});

// Create Storage Engine
const storage = new GridFsStorage({
    url: MonggoConn,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'personnelinfos'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });







//SHOW ALL PERSONNEL
router.get('/', async (req, res) => {

    try {

      const AllPersonnel = await personInfo.aggregate([
        {
            $match: { IsDeleted: { $ne: true } } // Match documents where IsDeleted is not true
        },
        {
            $addFields: {
              employmentDtl: {
                    $filter: {
                        input: "$employmentDtl", // Specify the array to filter
                        as: "maintenance", // Variable to represent each element in the array
                        cond: {
                          
                          
                          $ne: ["$$maintenance.IsDeleted", true] } // Condition to include only elements where IsDeleted is not true
                    },        
                }
            }
        },
        {
            $sort: { "employmentDtl.DteEnded": -1,} // Sort by MaintenanceDate in ascending order within the MaintenanceDtls array, then by createdOn in ascending order
        }
    ]);
        res.json(AllPersonnel)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Personnel' });
    }

});

router.get('/recieve', async (req, res) => {

  try {

    const AllPersonnel = await personInfo.aggregate([
      {
        $match: { IsDeleted: { $ne: true } } // Match documents where IsDeleted is not true
      },
      {
        $addFields: {
          employmentDtl: {
            $filter: {
              input: "$employmentDtl", // Specify the array to filter
              as: "employment", // Variable to represent each element in the array
              cond: {
                $and: [
                  { $ne: ["$$employment.IsDeleted", true] }, // Include if IsDeleted is not true
                  { $eq: ["$$employment.DteReceived", null] } // Include if DteReceived is null
                ]
              }
            }
          }
        }
      },
      {
        $sort: { "employmentDtl.DteEnded": -1 } // Sort by DteEnded in descending order within the employmentDtl array
      }
    ]);
      res.json(AllPersonnel)
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve All Personnel' });
  }

});


//COUNT EQUIPMENTS BY TYPE 
router.get('/dashboard', async (req, res) => {
  
  try {
    const currentDate = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = currentDate.toLocaleDateString('en-CA', options).replace(/\//g, '-'); // "2023-10-17"

    
    // Use the PersonnelInfo model to query the database
    const results = await personInfo.aggregate([
      {
        $unwind: '$employmentDtl',
      },
      {
        $match: {
          'employmentDtl.DteEnded': { $gt: formattedDate },
        },
      },
      {
        $group: {
          _id: '$employmentDtl.Designation',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by designation in ascending order
      },
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//SHOW ALL PERSONNEL BY ID
router.get('/:id', async (req, res) => {

  try {
   
    const AllPersonnel = await personInfo.findById(req.params.id)
      res.json(AllPersonnel)
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve All Personnel' });
  }

});


//SHOW ALL PERSONNEL contracts BY ID
router.get('/contracts/:id', async (req, res) => {

  try {
 
  const AllPersonnel = await personInfo.findById(req.params.id);

  if(!AllPersonnel){
    return res.status(404).json({ error: 'Employee does not exist.' });
  }
  
  const AllFalse = AllPersonnel.employmentDtl;
  const NotDeleted = AllFalse.filter(details=>!details.IsDeleted)
  const sorted = NotDeleted.sort((a, b) => b.updatedOn - a.updatedOn); // Sort by updatedOn in descending order

  return res.json(sorted);

  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve All Personnel' });
  }


});


//Insert batch Personel from excel
router.post('/batchfile', async (req,res)=>{
   
  try { 

    const newPersonnel = await personInfo.insertMany(req.body)
    res.status(201).json(newPersonnel);

  } catch (error){
      
      res.status(400).json({ error:'Failed to Save Employee on Database'})
      
   }
});



//Create New Personel
router.post('/', async (req,res)=>{
   
    try { 
      console.log('Passed Date : ', req.body);
      const newPersonnel = await personInfo.create(req.body);
      res.status(201).json(newPersonnel);

    } catch (error){
        
        res.status(400).json({ error:'Failed to Save Employee on Database'})
        
     }
});


//UPDATE PERSONNEL
router.put('/:id', async (req, res) => {
  try {
    console.log("update=",req.body);
    const updatedPersonnel = await personInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPersonnel) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(updatedPersonnel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//DELETE PERSONNEL
router.put('/delete/:id', async (req,res)=>{

  try {
   // const deletedpersonnel = await personInfo.findByIdAndRemove(req.params.id)
   let isDelete = req.body;
   isDelete.IsDeleted = true;
    console.log("isdelete=",req.body);
   const deletedpersonnel = await personInfo.findByIdAndUpdate(req.params.id,isDelete,{new:true});
  
    if (!deletedpersonnel) {
      return res.status(404).json({ error: 'Personnel Removed' });
    }
    res.json(deletedpersonnel)
   
  } catch (error) {
     res.status(500).json({ error: error.message });
  }

});


//VIEW  PERSONNEL BY ID
router.get('/:id', async (req, res) => {
  
    try {
        const personnels = await personInfo.find(req.params.id);
        res.json(personnels)
        res.sendStatus(200);
      } catch (error) {
        res.status(404).json({ error: 'Failed retrieving data' });
      }
});



//COUNT EQUIPMENTS BY TYPE 
router.get('/dashboard', async (req, res) => {
  try {
    // Use Mongoose aggregation to count EquipmentType
    const equipmentTypeCounts = await itEquipmentInfo.aggregate([
      {
       // $group stage: It groups documents by the "EquipmentType" field and calculates the count of each group using $sum. 
       //The result of this stage will have documents with "_id" representing the equipment types and "count" 
       //representing the count of each equipment type.
        $group: {
          _id: "$EquipmentType",
          count: { $sum: 1 }
        }
      },
      {
        //$project stage: It reshapes the output of the previous stage. 
        //It renames "_id" to "EquipmentType" and excludes the "_id" field (by setting it to 0). 
        //This results in a clean document structure with "EquipmentType" and "count" fields.
        $project: {
          _id: 0,
          EquipmentType: "$_id",
          count: 1
        }
      }
    ]);

    res.json(equipmentTypeCounts);
  } catch (error) {
    console.error('Error counting EquipmentType:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//INSERT NEW CONTRACT DETAILS ON PERSONNEL
router.post('/:id/contracts', async (req,res)=>{
  try {
    const updateContract = await personInfo.findByIdAndUpdate(req.params.id, { $push: { employmentDtl: req.body } }, { new: true });
    if (!updateContract) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(updateContract);   
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

//REMOVE CONTRACT DETAILS ON EMPLOYEE PROFILE
router.delete('/:id/contracts/:cid', async (req,res)=>{
  try {
    const EmployeeID = req.params.id;
    const ContractID = req.params.cid;
    
    const RemoveContract = await personInfo.findOneAndUpdate(
      { _id: EmployeeID },
      { $pull: { employmentDtl: { _id: ContractID } } },
      { new: true }
    );

    if (!RemoveContract) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // res.status(200).send.json('Maintenance Info Deleted.');
    res.json('Deleted Successfully!');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//remove contract history
router.put('/:id/contracts/remove/:cid', async (req,res)=>{
try {
  const pid = req.params.id;
  const cid = req.params.cid;
  // let forDelete = req.body;

  // forDelete.IsDeleted = true;

  // console.log("delete record=",req.body)

  const PersonnelRecord = await personInfo.findById(pid);
  if (!PersonnelRecord){
    return res.status(404).json({ error: 'Personnel Record not found' });
  }
  // const ContractRecordToDelete = PersonnelRecord.employmentDtl.findByIdAndUpdate(sub => sub._id == cid,{ $push: { employmentDtl: forDelete } },{new:true})
  // if (!ContractRecordToDelete){
  //   return res.status(404).json({ error: 'Unable to Update, Contract Not Found' });
  // }
  // res.json(ContractRecordToDelete);

  // Find the index of the contract in the employmentDtl array
  const contractIndex = PersonnelRecord.employmentDtl.findIndex(sub => sub._id == cid);

  if (contractIndex == -1) {
    return res.status(404).json({ error: 'Contract Not Found' });
  }

  // Mark the contract as deleted
  PersonnelRecord.employmentDtl[contractIndex].IsDeleted = true;

  // Save the updated personnel record
  await PersonnelRecord.save();

  res.json(PersonnelRecord.employmentDtl[contractIndex]);

} catch (error) {
  res.status(500).json({error:error.message})
}

});

//Update contract history
router.put('/:id/update/:cid', async (req,res)=>{
  try {
    // const pid = req.params.id;
    // const cid = req.params.cid;
    // let forDelete = req.body;
  
    // forDelete.IsDeleted = true;
  
     //console.log("delete record=",req.body.DteReceived)
  
    const PersonnelRecord = await personInfo.findById(req.params.id);
    if (!PersonnelRecord){
      return res.status(404).json({ error: 'Personnel Record not found' });
    }
 
    // Find the index of the contract in the employmentDtl array
    const contractIndex = PersonnelRecord.employmentDtl.findIndex(sub => sub._id ==  req.params.cid);
  
    if (contractIndex == -1) {
      return res.status(404).json({ error: 'Contract Not Found' });
    }
  
    // Mark the contract as deleted
    PersonnelRecord.employmentDtl[contractIndex].DteReceived= req.body.DteReceived;
  
    // Save the updated personnel record
    await PersonnelRecord.save();
  
    res.json(PersonnelRecord.employmentDtl[contractIndex]);
  
  } catch (error) {
    res.status(500).json({error:error.message})
  }
  
  });

  //Update contract history
router.put('/:id/contract/:cid', async (req,res)=>{
  try {
    // const pid = req.params.id;
    // const cid = req.params.cid;
    // let forDelete = req.body;
  
    const PersonnelRecord = await personInfo.findById(req.params.id);
    if (!PersonnelRecord){
      return res.status(404).json({ error: 'Personnel Record not found' });
    }
 
    // Find the index of the contract in the employmentDtl array
    const contractIndex = PersonnelRecord.employmentDtl.findIndex(sub => sub._id ==  req.params.cid);
  
    if (contractIndex == -1) {
      return res.status(404).json({ error: 'Contract Not Found' });
    }
  
     // Update specific fields of the contract
     if (req.body.DteReceived) PersonnelRecord.employmentDtl[contractIndex].DteReceived = req.body.DteReceived;
     if (req.body.DteStarted) PersonnelRecord.employmentDtl[contractIndex].DteStarted = req.body.DteStarted;
     if (req.body.DteEnded) PersonnelRecord.employmentDtl[contractIndex].DteEnded = req.body.DteEnded;
     if (req.body.Designation) PersonnelRecord.employmentDtl[contractIndex].Designation = req.body.Designation;
     if (req.body.Charges) PersonnelRecord.employmentDtl[contractIndex].Charges = req.body.Charges;
     if (req.body.Drate) PersonnelRecord.employmentDtl[contractIndex].Drate = req.body.Drate;
     if (req.body.EmpStatus) PersonnelRecord.employmentDtl[contractIndex].EmpStatus = req.body.EmpStatus;
     if (req.body.EmpStatus) PersonnelRecord.employmentDtl[contractIndex].Remarks = req.body.Remarks;

  
    // Save the updated personnel record
    await PersonnelRecord.save();
  
    res.json(PersonnelRecord.employmentDtl[contractIndex]);
  
  } catch (error) {
    res.status(500).json({error:error.message})
  }
  
  });


  
  //Get Particular contract history
router.get('/:id/contract/:cid', async (req,res)=>{
  try {
    // const pid = req.params.id;
    // const cid = req.params.cid;
    // let forDelete = req.body;
  
    const PersonnelRecord = await personInfo.findById(req.params.id);
    if (!PersonnelRecord){
      return res.status(404).json({ error: 'Personnel Record not found' });
    }
 
    // Find the index of the contract in the employmentDtl array
    const contractIndex = PersonnelRecord.employmentDtl.findIndex(sub => sub._id ==  req.params.cid);
  
    if (contractIndex == -1) {
      return res.status(404).json({ error: 'Contract Not Found' });
    }
  
    //  // Update specific fields of the contract
    //  if (req.body.DteReceived) PersonnelRecord.employmentDtl[contractIndex].DteReceived = req.body.DteReceived;
    //  if (req.body.DteStarted) PersonnelRecord.employmentDtl[contractIndex].DteStarted = req.body.DteStarted;
    //  if (req.body.DteEnded) PersonnelRecord.employmentDtl[contractIndex].DteEnded = req.body.DteEnded;
    //  if (req.body.Designation) PersonnelRecord.employmentDtl[contractIndex].Designation = req.body.Designation;
    //  if (req.body.Charges) PersonnelRecord.employmentDtl[contractIndex].Charges = req.body.Charges;
    //  if (req.body.Drate) PersonnelRecord.employmentDtl[contractIndex].Drate = req.body.Drate;
    //  if (req.body.EmpStatus) PersonnelRecord.employmentDtl[contractIndex].EmpStatus = req.body.EmpStatus;
  
    // Save the updated personnel record
    //await PersonnelRecord.save();
  
    res.json(PersonnelRecord.employmentDtl[contractIndex]);
  
  } catch (error) {
    res.status(500).json({error:error.message})
  }
  
  });










module.exports = router