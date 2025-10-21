
const mongoose = require('mongoose');

const ITEquipmentsSchema = new mongoose.Schema({
   
    EquipmentType : String,
    MachineName : String,
    PropertyCustodian : String,
    SerialNo : String,
    MaintenanceDtls : [{
        MaintenanceType : String,
        MaintenanceDate : {type: Date, default: Date.now},
        MaintenanceDesc : String,
        MaintenanceImage: String,
        IsDeleted: {type: Boolean, default: false},
        createdOn : {type: Date, default: Date.now}
    }],
   Remarks : String,
   IsDeleted: {type: Boolean, default: false},
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('ITEquipments',ITEquipmentsSchema);

