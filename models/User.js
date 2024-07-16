const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    id: mongoose.mongoose.Schema.Types.ObjectId,

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;