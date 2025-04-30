const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
        sparse: true
    },
    slackId: {
        type: String,
        sparse: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Editor', 'Viewer']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 