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
    image: {
        type: String,
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
}, {
    timestamps: true // 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 