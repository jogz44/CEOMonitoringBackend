const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const router = express.Router();
const UsersInfo = require("../models/UsersInfo");
const bcrypt = require("bcrypt");

//ADD NEW USERS
router.post("/", async (req, res) => {
  try {
    const NewUsersInfo = await UsersInfo.create(req.body);
    res.status(201).json(NewUsersInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//INSERT NEW CREDENTIALS
router.post("/:id/creds", async (req, res) => {
  try {
    const NewCreds = await UsersInfo.findByIdAndUpdate(
      req.params.id,
      { $push: { Credentials: req.body } },
      { new: true }
    );
    res.status(201).json(NewCreds);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//ADD NEW MAINTENANCE DETAILS ON USERS
// router.post('/:id/maintenance', async (req,res)=>{
//   try {

//     const updatedEquipment = await ProjectInfo.findByIdAndUpdate(req.params.id, { $push: { MaintenanceDtls: req.body } }, { new: true });

//     if (!updatedEquipment) {
//       return res.status(404).json({ error: 'Equipment not found' });
//     }

//     res.json(updatedEquipment);

//   } catch (error) {
//       res.status(400).json({ error: error.message });
//   }
// });

//REMOVE MAINTENANCE DETAILS ON USERS
// router.delete('/:id/maintenance/:mid', async (req,res)=>{
//   try {
//     const equipmentId = req.params.id;
//     const maintenanceId = req.params.mid;

//     const updatedEquipment = await EquipmentInfo.findOneAndUpdate(
//       { _id: equipmentId },
//       { $pull: { MaintenanceDtls: { _id: maintenanceId } } },
//       { new: true }
//     );

//     if (!updatedEquipment) {
//       return res.status(404).json({ error: 'Equipment not found' });
//     }

//     // res.status(200).send.json('Maintenance Info Deleted.');
//     res.json('Deleted Successfully!');
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

//READ ALL USERS
router.get("/", async (req, res) => {
  try {
    const AllUsersInfo = await UsersInfo.find({}).sort({ createdOn: 1 });
    // MachineName:1,
    // EquipmentType:1,
    // PlateNo:1,
    // PropertyCustodian:1,
    // MaintenanceDtls :1,
    // MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1}
    res.json(AllUsersInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve All Users" });
  }
});

//READ ALL Credentials of THE user
router.get("/:id/creds", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UsersInfo.findById({ _id: id });
    // MachineName:1,
    // EquipmentType:1,
    // PlateNo:1,
    // PropertyCustodian:1,
    // MaintenanceDtls :1,
    // MaintenanceDtls :{$slice: -1}}).sort({MaintenanceDtls : 1}
    const userCreds = user.Credentials || [];

    res.json(userCreds);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve All Users" });
  }
});

//READ SPECIFIC CREDENTIAL OF THE USER
router.get("/:id/creds/:cid", async (req, res) => {
  try {
    const uid = req.params.id;
    const cid = req.params.cid;

    const User = await UsersInfo.findById({ _id: uid });
    const UserCredentials = await User.Credentials.findById({ _id: cid });
    res.json(UserCredentials);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve specific credentials" });
  }
});

//READ SPECIFIC USER RECORD BY ID
router.get("/:id", async (req, res) => {
  try {
    const GetUsersInfo = await UsersInfo.findById(req.params.id);
    if (!GetUsersInfo) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(GetUsersInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




//Update SPECIFIC CREDENTIAL OF THE USER
router.put("/:id/creds/:cid", async (req, res) => {
  const userId = req.params.id;
  const moduleId = req.params.cid;

  try {
    // Find the user by ID
    const user = await UsersInfo.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the credentials for the specified module
    const credentials = user.Credentials.find(cred => cred._id == moduleId);
    //res.json(req.body.Create)
    if (!credentials) {
      return res.status(404).json({ error: 'Credentials for the module not found' });
    }

    // Update credentials based on the request body
    credentials.Module = req.body.Module;
    credentials.Create = req.body.Create;
    credentials.Remove = req.body.Remove;
    credentials.Update = req.body.Update;
    credentials.Display = req.body.Display;
   // credentials.Display = req.body.Display || credentials.Display;

    // Save the updated user
    await user.save();

    res.json({ message: 'Credentials updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a specific user record by ID
// router.put("/:id", async (req, res) => {
//   const id = req.params.id;
//   const UpdatedData = req.body;
//   try {
//     const updatedUsersInfo = await UsersInfo.findByIdAndUpdate(id,{$set:UpdatedData}, { new: true });
//     if (!updatedUsersInfo) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json(updatedUsersInfo);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  console.log(req.body)

  try {
    // Find the user by ID and update the fields
    const user = await UsersInfo.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//DELETE USERS
router.delete("/:id", async (req, res) => {
  try {
    const deletedUsersInfo = await UsersInfo.findByIdAndRemove(req.params.id);
    if (!deletedUsersInfo) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(deletedUsersInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//DELETE USER CREDENTIALS
router.delete('/:userId/creds/:moduleId', async (req, res) => {
  const userId = req.params.userId;
  const moduleId = req.params.moduleId;

  try {
    // Find the user by ID
    const user = await UsersInfo.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Find the index of the credentials for the specified module
    const credentialsIndex = user.Credentials.findIndex(cred => cred._id == moduleId);

    if (credentialsIndex == -1) {
      return res.status(404).json({ error: 'Credentials for the module not found' });
    }

    // Remove the credentials for the specified module
    user.Credentials.splice(credentialsIndex, 1);

    // Save the updated user
    await user.save();
    res.json({ message: 'Credentials deleted successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// //login
// router.get("/login", async (req, res) => {
//   try {
//     const UserData= {
//       username : req.body.Username,
//       password : req.body.Password
//     };
   
//     // Find the user by username
//     const user = await UsersInfo.findOne({ Username: UserData.username });

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     // Compare the provided password with the hashed password in the database
//     const passwordMatch = bcrypt.compare(UserData.password, user.Password);

//     if (!passwordMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     // User is authenticated
//     return res.status(200).json(user.Credentials);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = router;
