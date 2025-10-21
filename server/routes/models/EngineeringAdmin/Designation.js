const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
    
   Designation: String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('LibDesignation', DesignationSchema );