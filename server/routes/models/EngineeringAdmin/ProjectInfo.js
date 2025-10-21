const mongoose = require('mongoose');

const ProjectsInfoSchema = new mongoose.Schema({
    
    ProjectName: String,
    Location: String,
    ReferenceNo: String,
    TotalProjectCost: Number,
    DateStarted: {type: Date, default: Date.now},
    TargetAccomplished: {type: Date, default: Date.now},
    DateAccomplished: {type: Date, default: Date.now},
    ProjectInCharge: String,
    createdOn : {type: Date, default: Date.now},
    ProjectUpdates:[{
        DateUpdate: {type: Date, default: Date.now},
        ImageUpdate:String,
        UpdateDescription:String,
        IsDeleted: {type: Boolean, default: false},
        createdOn : {type: Date, default: Date.now},
    }],
    IsDeleted: {type: Boolean, default: false},
    
    
});

module.exports = mongoose.model('ProjectInfos',ProjectsInfoSchema);