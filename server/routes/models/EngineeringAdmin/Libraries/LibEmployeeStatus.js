const mongoose = require('mongoose');

const LibEmployeeStatusSchema = new mongoose.Schema({
    
   status: String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('LibEmployeeStatus', LibEmployeeStatusSchema );