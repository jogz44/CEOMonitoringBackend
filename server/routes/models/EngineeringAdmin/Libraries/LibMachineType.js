const mongoose = require('mongoose');

const MachineTypeSchema = new mongoose.Schema({
    
   MachineType: String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('LibMachineType', MachineTypeSchema );