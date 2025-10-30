const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const router = express.Router();
const UsersInfo = require("../models/UsersInfo");
const bcrypt = require("bcrypt");





//login
// router.post("/login", async (req, res) => {
//     try {
//       const UserLogin = {username: req.body.Username, password: req.body.Password};

//         res.json( UserLogin );
            
      
//     //     const username = req.body.Username;
//     //     const password = req.body.Password;
     
     
//        // Find the user by username
//        const user = await UsersInfo.findOne({ Username: UserLogin.username });
  
//        if (!user) {
//          return res.status(404).json({ message: "User not found" });
//        }
  
//        // Compare the provided password with the hashed password in the database
//        const passwordMatch = bcrypt.compare(UserLogin.password, user.Password);
  
//        if (!passwordMatch) {
//          return res.status(404).json({ message: "Invalid password" });
//        }
  
//      // User is authenticated
//        return res.status(200).json(user);
  
//      } catch (error) {
//        console.error(error);
//        return res.status(500).json({ message: "Server error" });
//      }
//   });



 router.post("/login", async (req, res) => {
  try {
    const UserLogin = { username: req.body.Username, password: req.body.Password };

    // Send an immediate response if needed (e.g., for testing purposes)
    // res.json(UserLogin);

    // Find the user by username
    const user = await UsersInfo.findOne({ Username: UserLogin.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(UserLogin.password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // User is authenticated
    return res.status(200).json(user);
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;