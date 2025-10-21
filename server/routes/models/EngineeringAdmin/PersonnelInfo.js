
const mongoose = require('mongoose');

const PersonnelSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    IsDeleted: {type: Boolean, default: false},
    employmentDtl: [{
        DteReceived: String,
        DteStarted: String,
        DteEnded: String,
        Designation: String,
        Charges: String,
        updatedOn: {type: Date, default: Date.now}, 
        Drate: String,   
        EmpStatus: String,
        IsDeleted: {type: Boolean, default: false},
        Remarks: String,
        encodedBy: String,
    }],
    encodedBy: String,
    resumeLink: { data: Buffer, // Store image data as a Buffer
                 fileType: String, // MIME type of the image
                },
    createdOn: {type: Date, default: Date.now},
    
    
});

module.exports = mongoose.model('PersonnelInfo', PersonnelSchema);