const Biodata = require('../models/BiodataModel');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');

const getNextSequence = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

exports.createOrUpdateBiodata = async (req, res) => {
    try {
        const userEmail = req.user.email; // Assuming you have the user's email from authentication
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let biodata = await Biodata.findOne({ _id: user.biodata });

        if (biodata) {
            // Update existing biodata
            Object.assign(biodata, req.body);
            biodata.contactEmail = userEmail;
        } else {
            // Create new biodata
            const nextBiodataId = await getNextSequence('biodataId');
            biodata = new Biodata({ ...req.body, biodataId: nextBiodataId, contactEmail: userEmail });
            user.biodata = biodata._id;
        }

        await biodata.save();
        await user.save();

        res.status(200).json(biodata);
    } catch (error) {
        console.error('Error creating/updating biodata:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.getBiodatas = async (req, res) => {
    const { page = 1, limit = 10, ageRange, biodataType, division } = req.query;

    const query = {};

    if (ageRange) {
        const [minAge, maxAge] = ageRange.split('-').map(Number);
        query.age = { $gte: minAge, $lte: maxAge };
    }

    if (biodataType) {
        query.biodataType = biodataType;
    }

    if (division) {
        query.$or = [
            { permanentDivision: division },
            { presentDivision: division },
        ];
    }

    try {
        const biodatas = await Biodata.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Biodata.countDocuments(query);

        res.status(200).json({
            biodatas,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBiodata = async (req, res) => {
    try {
        const deletedBiodata = await Biodata.findOneAndDelete({ biodataId: req.params.biodataId });
        if (!deletedBiodata) {
            return res.status(404).json({ message: 'Biodata not found' });
        }
        res.status(200).json({ message: 'Biodata deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBiodataById = async (req, res) => {
    try {
        const biodata = await Biodata.findOne({ biodataId: req.params.biodataId });
        if (!biodata) {
            return res.status(404).json({ message: 'Biodata not found' });
        }
        res.status(200).json(biodata);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


