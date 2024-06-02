const mongoose = require('mongoose');

const biodataSchema = new mongoose.Schema({
    biodataType: {
        type: String,
        enum: ['Male', 'Female'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    occupation: {
        type: String,
        required: true,
    },
    race: {
        type: String,
        required: true,
    },
    fathersName: {
        type: String,
        required: true,
    },
    mothersName: {
        type: String,
        required: true,
    },
    permanentDivision: {
        type: String,
        enum: ['Dhaka', 'Chattagram', 'Rangpur', 'Barisal', 'Khulna', 'Maymansign', 'Sylhet'],
        required: true,
    },
    presentDivision: {
        type: String,
        enum: ['Dhaka', 'Chattagram', 'Rangpur', 'Barisal', 'Khulna', 'Maymansign', 'Sylhet'],
        required: true,
    },
    expectedPartnerAge: {
        type: Number,
    },
    expectedPartnerHeight: {
        type: Number,
    },
    expectedPartnerWeight: {
        type: Number,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Biodata = mongoose.model('Biodata', biodataSchema);

module.exports = Biodata;
