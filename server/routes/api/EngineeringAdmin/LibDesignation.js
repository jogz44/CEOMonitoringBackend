const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const router = express.Router();
const DesignationLib    = require('../../models/EngineeringAdmin/Designation');


//INSERT NEW DESIGNATION
router.post('/', async (req,res) => {
    try{
        const designation = await DesignationLib.create(req.body)
        
        if (!designation){
        return  res.status(404).json({ error: error.message });
        }
        else {
          return  res.status(201).json(designation);
        }
    }
    catch (error)
    {
        res.status(400).json({ error: error.message });
    }

});

//RETRIEVE ALL LIST OF DESIGNATION
router.get('/', async (req,res)=>{

    try{
        const designation = await DesignationLib.find({})
        
        if (!designation){
          return  res.status(404).json('List Not Found or List is Empty');
        }
        else {
            res.status(201).json(designation);
        }
    }
    catch (error)
    {
        res.status(400).json({ error: error.message });
    }

});

//RETRIEVE SPECIFIC DESIGNATION FROM THE LIST
router.get('/:id', async (req,res)=>{

    try{
        const designation = await DesignationLib.findById(req.params.id)
        
        if (!designation){
         return  res.status(404).json('List Not Found or List is Empty');
        }
        else {
            res.status(201).json(designation);
        }
    }
    catch (error)
    {
        res.status(500).json({ error: error.message });
    }

});

//UPDATE SPECIFIC DESIGNATION FROM THE LIST
router.put('/:id', async (req, res) => {
    try {
      const designation = await DesignationLib.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!designation) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(designation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//DELETE SPECIFIC DESIGNATION FROM THE LIST
  router.delete('/:id', async (req,res)=>{
    try {
        const designation = await DesignationLib.findByIdAndRemove(req.params.id);
        if (!designation) {
          return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(designation);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
});
    








module.exports = router