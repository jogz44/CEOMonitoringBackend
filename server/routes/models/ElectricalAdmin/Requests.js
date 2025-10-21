const mongoose = require('mongoose');

const RequestsSchema = new mongoose.Schema({
    
   RequestDesc: String,
   ContactNo: String,
   RequestedBy:String,
   AssignedGroup: String,
   AssignedSubGroup:String,
   Cluster: String,
   Remarks:String,
   Location: {
    Barangay: String,
    Purok: String,
    Street: String,
   }, 
   Status: String,
   IsDeleted: Boolean,
   createdOn : {type: Date, default: Date.now} 
});

module.exports = mongoose.model('requestsInfos',RequestsSchema);