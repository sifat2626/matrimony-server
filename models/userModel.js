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
        unique: true,  // Ensures that each user can only have one biodata
    },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

