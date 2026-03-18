const mongoose = require('mongoose');

const EquipmentsSchema = new mongoose.Schema({

    EquipmentCategory : { type: String, trim: true },
    EquipmentType : { type: String, trim: true },
    MachineName : { type: String, trim: true },
    PropertyCustodian : { type: String, trim: true },
    Operator: { type: String, trim: true },
    PlateNo : { type: String, trim: true },
    BodyNo: { type: String, trim: true },
    SerialNo : { type: String, trim: true },
    DateAquired : {type: Date, default: Date.now},
    Cost: {type: mongoose.Decimal128,
         default: 0.0,
         get: v => (v ? parseFloat(v.toString()) : 0.0),
         set: v => parseFloat(v).toFixed(2)
        },
    IsDeleted: {type: Boolean, default: false},
    MaintenanceDtls : [{
        MaintenanceType : { type: String, trim: true },
        MaintenanceDate : {type: Date, default: Date.now},
        MaintenanceDesc : { type: String, trim: true },
        MaintenanceImageProof: { type: String, trim: true },
        IsDeleted: {type: Boolean, default: false},
        createdOn : {type: Date, default: Date.now}
    }],
   Remarks : { type: String, trim: true },
   EquipmentImage : { type: [String], default: [], trim: true },
   createdOn : {type: Date, default: Date.now}
    
    
},
{
  toJSON: { 
    getters: true,
    transform: function (doc, ret) {
        // Helper function to format date as yyyy-MM-dd
        const formatDate = (d) =>
          d ? new Date(d).toISOString().split('T')[0] : d;

        // Format top-level dates
        ret.DateAquired = formatDate(ret.DateAquired);
        ret.createdOn = formatDate(ret.createdOn);

        // Format nested MaintenanceDtls dates
        if (ret.MaintenanceDtls && Array.isArray(ret.MaintenanceDtls)) {
          ret.MaintenanceDtls = ret.MaintenanceDtls.map((m) => ({
            ...m,
            MaintenanceDate: formatDate(m.MaintenanceDate),
            createdOn: formatDate(m.createdOn),
          }));
        }

        return ret;
      },

   },  // enable getters when converting to JSON
  toObject: { getters: true },
});

module.exports = mongoose.model('Equipments',EquipmentsSchema);