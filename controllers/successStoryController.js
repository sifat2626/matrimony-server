const SuccessStory = require('../models/successStoryModel');

// Function to create or update a success story
exports.createOrUpdateSuccessStory = async (req, res) => {
    try {
        const { selfBiodataId, partnerBiodataId, coupleImageLink, review, marriageDate, rating } = req.body;

        // Check if required fields are present
        if (!selfBiodataId || !partnerBiodataId || !review || !rating) {
            return res.status(400).json({ message: "selfBiodataId, partnerBiodataId, review, and rating are required fields." });
        }

        // Find if the success story already exists
        let successStory = await SuccessStory.findOne({ selfBiodataId });

        if (successStory) {
            // Update the existing success story
            successStory.coupleImageLink = coupleImageLink;
            successStory.partnerBiodataId = partnerBiodataId;
            successStory.review = review;
            successStory.marriageDate = marriageDate;
            successStory.rating = rating;
            await successStory.save();
            return res.status(200).json({ message: "Success story updated successfully.", successStory });
        } else {
            // Create a new success story
            successStory = new SuccessStory({
                selfBiodataId,
                partnerBiodataId,
                coupleImageLink,
                review,
                marriageDate,
                rating
            });
            await successStory.save();
            return res.status(201).json({ message: "Success story created successfully.", successStory });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while processing the success story." });
    }
};

exports.getAllSuccessStories = async (req, res) => {
    try {
        const successStories = await SuccessStory.find();
        res.status(200).json({ successStories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching success stories." });
    }
};

// Get a Single Success Story
exports.getSuccessStory = async (req, res) => {
    try {
        const { id } = req.params;

        const successStory = await SuccessStory.findOne({
            $or: [
                { selfBiodataId: id },
                { partnerBiodataId: id }
            ]
        });

        if (!successStory) {
            return res.status(404).json({ message: "Success story not found." });
        }

        res.status(200).json({ successStory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the success story." });
    }
};

// Get Success Stories Count
exports.getSuccessStoriesCount = async (req, res) => {
    try {
        const count = await SuccessStory.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the success stories count." });
    }
};
