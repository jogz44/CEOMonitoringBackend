const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


const UsersInfoSchema = new mongoose.Schema({
    
    Username: String,
    Password: String,
    IdNo: Number,
    FirstName:String,
    MiddleName:String,
    LastName:String,
    Designation:String,
    Office:String,
    isAdmin: { type: Boolean, default: false},
    Credentials: [{
        Module: { type: String, default:''},
        Create: { type: Boolean, default: false },
        Remove: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        Display: { type: Boolean, default: false },
    }],
    createdOn : {type: Date, default: Date.now}
    
    
});

UsersInfoSchema.pre('save', async function (next) {
    const user = this;

    // Only hash the password if it's modified (or new)
    if (!user.isModified('Password')) return next();

    try {
        // Generate a salt and hash the password with the salt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.Password, salt);

        // Replace the plain password with the hashed password
        user.Password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('UsersInfos',UsersInfoSchema);