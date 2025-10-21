const mongoose = require('mongoose');

const EquipmentsSchema = new mongoose.Schema({
    
    EquipmentType : String,
    MachineName : String,
    PropertyCustodian : String,
    PlateNo : String,
    IsDeleted: {type: Boolean, default: false},
    MaintenanceDtls : [{
        MaintenanceType : String,
        MaintenanceDate : {type: Date, default: Date.now},
        MaintenanceDesc : String,
        MaintenanceImageProof: String,
        IsDeleted: {type: Boolean, default: false},
        createdOn : {type: Date, default: Date.now}
    }],
   Remarks : String,
   createdOn : {type: Date, default: Date.now}
    
    
});

module.exports = mongoose.model('Equipments',EquipmentsSchema);