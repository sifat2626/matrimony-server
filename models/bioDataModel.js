const mongoose = require('mongoose');

const biodataSchema = new mongoose.Schema({
    biodataType: {
        type: String,
        required: true,
        enum: ['Male', 'Female'] // Ensures input must be either 'Male' or 'Female'
    },
    name: { type: String, required: true },
    profileImage: { type: String, default:'https://i.ibb.co/qB1vk9v/user.png' }, // Can be a URL or a file path
    dateOfBirth: { type: Date, required: true },
    height: { type: Number, required: true }, // Must select input
    weight: { type: Number, required: true }, // Must select input
    age: { type: Number, required: true },
    occupation: { type: String, required: true }, // Must select input
    race: {
        type: String,
        required: true,
        enum: ['Fair', 'Medium', 'Brown', 'Dark'] // Must select input
    },
    fathersName: { type: String },
    mothersName: { type: String },
    permanentDivision: {
        type: String,
        required: true,
        enum: ['Dhaka', 'Chattagram', 'Rangpur', 'Barisal', 'Khulna', 'Mymensingh', 'Sylhet'] // Must select input
    },
    presentDivision: {
        type: String,
        required: true,
        enum: ['Dhaka', 'Chattagram', 'Rangpur', 'Barisal', 'Khulna', 'Mymensingh', 'Sylhet'] // Must select input
    },
    expectedPartnerAge: { type: Number },
    expectedPartnerHeight: { type: Number, required: true }, // Must select input
    expectedPartnerWeight: { type: Number, required: true }, // Must select input
    contactEmail: { type: String, required: true, immutable: true }, // Read-only user email
    mobileNumber: { type: String, required: true }, // Required
    biodataId: { type: Number, unique: true }, // Ensure biodataId is unique
}, { timestamps: true });

// Check for existing model before creating a new one
module.exports = mongoose.models.Biodata || mongoose.model('Biodata', biodataSchema);
