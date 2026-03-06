const mongoose = require('mongoose');

const MachineCategorySchema = new mongoose.Schema({
    
   category: String,
   createdOn : {type: Date, default: Date.now}
    
});

module.exports = mongoose.model('LibMachineCategory', MachineCategorySchema );