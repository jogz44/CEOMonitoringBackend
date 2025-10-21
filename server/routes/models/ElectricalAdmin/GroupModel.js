const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    
     GroupName: String,
        SubGroup:[{
            SubGroupName: String,
            GroupCluster: [{
                ClusterName: String,
            }]
        }],

   createdOn : {type: Date, default: Date.now} 
});

module.exports = mongoose.model('MaintenanceGroupsInfo',GroupSchema);