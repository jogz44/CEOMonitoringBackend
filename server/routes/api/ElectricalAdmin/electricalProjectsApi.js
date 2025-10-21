const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const router = express.Router();
const ProjectInfo = require('../../models/ElectricalAdmin/Projects');




  //GET ALL PROJECTS
router.get('/', async (req, res) => {
    try {
    
        const Allprojects = await ProjectInfo.find({});

      
        res.json(Allprojects)

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve all Projects' });
    }
});

//GET REQUESTED PROJECT BY ID
router.get('/:pid', async (req,res)=>{
    try {
        const pid = req.params.pid
  
          const Project = await ProjectInfo.findById({_id: pid});
       // console.log(Project);
      
          res.json(Project)
      } catch (error) {
          res.status(500).json({ error: 'Failed to retrieve requested Project' });
      }
});

//GET MATERIALS LIST UNDER A PROJECT
router.get('/:projectid/materials/', async (req,res)=>{
    try {
        const id = req.params.projectid;
        const Project = await ProjectInfo.findById ({_id: id});

        if (!Project){
            return res.status(404).json({message: 'Project not found.'});
        }
        
        const Materials = Project.MaterialsWithdrawn || [];

        res.json(Materials)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//  ADD PROJECT INFORMATION
router.post('/newprojects', async (req,res)=>{
    try {
        const newproject = await ProjectInfo.create(req.body)
        res.status(201).json(newproject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

router.put('/update/:id', async (req,res)=>{
try {
    const pid = req.params.id;
    const Updateproject = await ProjectInfo.findByIdAndUpdate(pid,
                                                              req.body,
                                                              {new:true}
    );
    if (!Updateproject) {
        return res.status(204).json({ error: 'Unable to update project' });
        }
      res.json(Updateproject);

} catch (error) {
    
}
});

//ADD WITHDRAWN MATERIALS  UNDER A PROJECT
router.post('/:projectid/materials/new',async (req,res)=>{
    try {

        const id = req.params.projectid
        const newMaterials = await ProjectInfo.findByIdAndUpdate(id, { $push: { MaterialsWithdrawn: req.body } }, { new: true });
        res.json(newMaterials)  
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});





module.exports = router
