const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const RequestsInfo = require('../../models/ElectricalAdmin/Requests');



//  CREATE REQUEST INFORMATION
router.post('/new', async (req,res)=>{
    try {
        const newRequests = await RequestsInfo.create(req.body);
        res.status(201).json(newRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

// READ ALL REQUESTS INFORMATIONS
router.get('/', async (req,res)=>{

    try {
        const getAllRequests = await RequestsInfo.find({ IsDeleted: { $ne: true }}).sort({createdOn : 1 });

        if (!getAllRequests) {
            return res.status(404).json({ error: 'Job Request not found' });
          }
        res.json(getAllRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

// READ REQUESTS INFORMATION BY ID
router.get('/:id', async (req,res)=>{

    try {

        const reqId = req.params.id
        const getAllRequests = await RequestsInfo.findOne(
            {
                _id: reqId
            }
            );

        if (!getAllRequests) {
            return res.status(404).json({ error: 'Job Request not found' });
          }
        res.json(getAllRequests);
    } catch (error) {
        
    }
})




// UPDATE REQUEST INFORMATION
router.put('/update/:id',async (req,res)=>{
    try {
        const UpdateRequest = await RequestsInfo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
          );
          if (!UpdateRequest) {
            return res.status(404).json({ error: 'Equipment not found' });
          }
          res.json(UpdateRequest);
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

})


// // REMOVE REQUEST INFORMATION
// router.put('/requests/:id/update',async (req,res)=>{
//     try {
//         const UpdateRequest = await RequestsInfo.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//           );
//           if (!UpdateRequest) {
//             return res.status(404).json({ error: 'Equipment not found' });
//           }
//           res.json(UpdateRequest);
        
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }

// })


module.exports = router
