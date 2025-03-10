const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    premiumStatus: {
        type: String,
        default: 'Regular'
    },
    role: {
        type: String,
        default: 'user'
    },
    approvedContactIds: {
        type: [Number], // Specify that these are ObjectIds
        default: [],
    },
    requestedContactIds: [{
        biodataId: Number,
        requestTime: { type: Date, default: Date.now }
    }],
    biodata: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Biodata',
    },
}, { timestamps: true });
const User = mongoose.model('User', userSchema)

module.exports = User;

