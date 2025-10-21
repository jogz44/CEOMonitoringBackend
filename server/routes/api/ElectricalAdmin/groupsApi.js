const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const router = express.Router();
const GroupInfo = require('../../models/ElectricalAdmin/GroupModel');




//ADD NEW EQUIPMENTS
router.post('/', async (req,res)=>{
    try {
       
        const newgroup = await GroupInfo.create(req.body)
        res.status(200).json(newgroup);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  });

// Create a new SubGroup within a Group
router.post('/:id/subgroup', async (req,res)=>{
    try { 
      const insertSubgroup = await GroupInfo.findByIdAndUpdate(req.params.id, { $push: { SubGroup: req.body } }, { new: true });
      if (!insertSubgroup) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(insertSubgroup)  
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  });

// Create a new ClusterGroup within a SubGroup
router.post('/:id/subgroup/:sid/clusters', async (req,res)=>{
          const GroupID = req.params.id;
          const SubGroupId = req.params.sid;
          const NewClusterData = req.body;

  try {
    
      const group = await GroupInfo.findById(GroupID);
      if (!group) {
        return res.status(404).json({ message: 'Maintenance Group not found' });
      }
  
      const subgroup = group.SubGroup.find(sub => sub._id == SubGroupId);
      if (!subgroup) {
        return res.status(404).json({ message: 'SubGroup not found' });
      }
  
      //const newCluster = new subgroup.GroupCluster(NewClusterData);
      const newCluster = subgroup.GroupCluster.push(NewClusterData);
      await group.save();
  
      res.status(201).json(newCluster);
   
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
  });



  //GET ALL GROUPNAMES
  router.get('/group-names', async (req, res) => {
    try {
    

        const GroupNames = await GroupInfo.find({},{GroupName:1});

        res.json(GroupNames)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Users' });
    }
});
  //Get ALL Groups
  router.get('/', async (req, res) => {
    try {
    

        const allGroups = await GroupInfo.find({});

        res.json(allGroups)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Users' });
    }
});

  //Get Particular Member of A Group
  router.get('/member/:gid', async (req, res) => {
    try {
      const gid = req.params.gid

        const GroupMember = await GroupInfo.find({_id: gid});
     
        res.json(GroupMember)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve All Users' });
    }
});

//GET ALL SUBGROUP from a Group
router.get('/member/:id/subgroup/', async (req, res) => {
  try {

    const idGroup = req.params.id;
   // const idSGroup = req.params.sid;

      const GetSubGroup = await GroupInfo.find(
        {
        _id: idGroup,
        },
        {
         SubGroup: 1,
        }
      
      );

     res.json(GetSubGroup)
  } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve Subgroups' });
  }
});


//GET SUBGROUP
router.get('/member/:id/SubGroup/:sid', async (req, res) => {
  try {

    const idGroup = req.params.id;
    const idSGroup = req.params.sid;

      const allGroups = await GroupInfo.findOne(
        {
        _id: idGroup,
        'SubGroup._id': idSGroup,
        },
        {
         'SubGroup.$': 1, // Include only the matched subgroup 
     
        }
      
      );

     res.json(allGroups)
  } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve Subgroups' });
  }
});

//GET CLUSTER OF SUBGROUP
router.get('/member/:id/SubGroup/:sid/clusters', async (req, res) => {
  try {

    const idGroup = req.params.id;
    const idSGroup = req.params.sid;

    const group = await GroupInfo.findById(idGroup);
    if (!group) {
      return res.status(404).json({ message: 'Maintenance Group not found' });
    }
    const subgroup = group.SubGroup.find(sub=> sub._id==idSGroup)
    if (!subgroup) {
      return res.status(404).json({ message: 'SubGroup not found' });
    }
    const groupClusters = subgroup.GroupCluster;

     res.json(groupClusters)
  } catch (error) {
      
      res.status(500).json({ error: 'Failed to retrieve Subgroups' });
  }
});

//GET PARTICULAR CLUSTER OF SUBGROUP
router.get('/member/:id/SubGroup/:sid/clusters/:cid', async (req, res) => {
  try {

    const idGroup = req.params.id;
    const idSGroup = req.params.sid;
    const idCluster = req.params.cid;

    const group = await GroupInfo.findById(idGroup);
    if (!group) {
      return res.status(404).json({ message: 'Maintenance Group not found' });
    }

    const subgroup = group.SubGroup.find(sub=> sub._id==idSGroup)
    if (!subgroup) {
      return res.status(404).json({ message: 'SubGroup not found' });
    }
    const groupClusters = subgroup.GroupCluster.find(cluster=> cluster._id==idCluster);

    if (!groupClusters) {
      return res.status(404).json({ message: 'GroupCluster not found' });
    }

     res.json(groupClusters)
  } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to retrieve, Internal Server Error' });
  }
});





module.exports = router