const mongoose = require('mongoose');

const ITequipmentLibrarySchema = new mongoose.Schema({
    
   equipment: String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('LibITequipments', ITequipmentLibrarySchema );