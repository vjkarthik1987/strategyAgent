const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const teams = require('./teams.js'); // Temporary L1 & L2 team storage

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    company: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Company', 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    l1Team: { 
        type: String, 
        enum: teams.l1Teams, // Temporary enum values
        required: true 
    },
    l2Team: { 
        type: String, 
        enum: teams.l2Teams, // Temporary enum values
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// **Passport.js Authentication Plugin**
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model('User', UserSchema);