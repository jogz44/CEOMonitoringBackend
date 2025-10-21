const mongoose = require('mongoose');

const SysModulesSchema = new mongoose.Schema({
    
   ModuleName : String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('Modules',SysModulesSchema);