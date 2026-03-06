const mongoose = require('mongoose');

const ITequipmentTypeLibrarySchema = new mongoose.Schema({
    
   equipment: String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('LibITequipmentType', ITequipmentTypeLibrarySchema );