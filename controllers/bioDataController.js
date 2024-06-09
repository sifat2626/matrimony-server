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
    console.log(req.query)
    const { page = 1, limit = 10, minAge,maxAge, biodataType, division } = req.query;

    const query = {};

    if (minAge && maxAge) {
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

exports.getUserBiodata = async (req, res) => {
    try {
        const {email} = req.user
        const biodata = await Biodata.findOne({ email });
        if (!biodata) {
            return res.status(404).json({ message: 'Biodata not found' });
        }
        res.status(200).json(biodata);
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
exports.getBiodataByEmail = async (req, res) => {
    try {
        const biodata = await Biodata.findOne({ contactEmail: req.params.email });
        if (!biodata) {
            return res.status(400).json({ message: 'Biodata not found' });
        }
        res.status(200).json(biodata);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getBiodataId = async (req, res) => {
    try {
        const {id}= req.params
        const biodata = await Biodata.findById(id);
        if (!biodata) {
            return res.status(400).json({ message: 'Biodata not found' });
        }
        const biodataId = biodata.biodataId
        res.status(200).json(biodataId);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.biodataStats = async (req, res) => {
    try {
        // Correctly call the estimatedDocumentCount method
        const totalBiodata = await Biodata.estimatedDocumentCount();

        // Use countDocuments to get the count of male and female users
        const maleUsers = await Biodata.countDocuments({ biodataType: 'Male' }); // Ensure case matches enum
        const femaleUsers = await Biodata.countDocuments({ biodataType: 'Female' }); // Ensure case matches enum
        const premiumMembers = await Biodata.countDocuments({premiumStatus:'Premium'})

        // Create the statData object
        const statData = {
            count: totalBiodata,
            maleCount: maleUsers,
            femaleCount: femaleUsers,
            premiumCount: premiumMembers,
        };

        // Respond with the statData object
        res.status(200).json(statData);
    } catch (error) {
        console.error('Error in biodataStats:', error); // Enhanced error logging
        res.status(500).json({ message: error.message });
    }
};

