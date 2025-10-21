const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const router = express.Router();
const materialItems = require('../../models/Materials/Items');


//ADD NEW Materials
router.post('/', async (req,res)=>{
    try {
       
        const NewMaterials = await materialItems.create(req.body)
        res.status(200).json(NewMaterials);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//GET ALL Materials
  router.get('/', async (req, res) => {
    try {
        const Materials = await materialItems.find({});
        res.json(Materials)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Materials' });
    }
});

//GET  Specific MATERIAL
router.get('/:id', async (req, res) => {
    const materialID = req.params.id;
    try {
        const Materials = await materialItems.find({materialID},{createdOn:1});
        res.json(Materials)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Materials' });
    }
});



router.put('/:id', async (req, res) => {
    const materialID = req.params.id;
    const updates = req.body;
  
   // console.log(req.body)
  
    try {
      // Find the user by ID and update the fields
      const materialItems = await materialItems.findByIdAndUpdate(materialID, updates, { new: true });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(materialItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


//DELETE MATERIAL
router.delete("/:id", async (req, res) => {
    try {
      const deletedmaterialItems = await materialItems.findByIdAndRemove(req.params.id);

      if (!deletedmaterialItems) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(deletedmaterialItems);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


module.exports = router


