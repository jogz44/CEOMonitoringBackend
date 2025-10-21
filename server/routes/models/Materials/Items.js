const mongoose = require('mongoose');

const ItemsSchema = new mongoose.Schema({
    MaterialCategory : String,
    MaterialName : String,
    MaterialCost : String,
    MaterialUnit : String,
    UploadedBy: String,
   createdOn : {type: Date, default: Date.now},

});

module.exports = mongoose.model('ItemInfo',ItemsSchema);