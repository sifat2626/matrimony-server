const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
    selfBiodataId: {
        type: Number,
        required: true
    },
    partnerBiodataId: {
        type: Number,
        required: true
    },
    coupleImageLink: {
        type: String,
        required: false
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    marriageDate: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { timestamps: true, versionKey: false });

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

module.exports = SuccessStory;
