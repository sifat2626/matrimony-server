const User = require('../models/userModel');
const Biodata = require('../models/bioDataModel');
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
    try {
        const { email, name } = req.body;
        console.log(email,name)
        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json(existingUser);
        }
        console.log('before')
        const newUser = new User({ email, name });
        const savedUser = await newUser.save();
        console.log('after')
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.requestContact = async (req, res) => {
    const { biodataId } = req.params;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            {email:req.user.email},
            { $addToSet: { requestedContactIds: biodataId } }, // Add to the array if it doesn't already exist
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ message: 'Contact requested successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while requesting contact' });
    }
};

exports.acceptContact = async (req, res) => {
    const { biodataId } = req.params;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            {email:req.user.email},
            {
                $pull: { requestedContactIds: biodataId }, // Remove from the requested contacts
                $addToSet: { approvedContactIds: biodataId } // Add to the approved contacts
            },
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ message: 'Contact accepted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while accepting contact' });
    }
};

exports.requestedContacts = async (req, res) => {
    try {
        // Fetch all users who have made contact requests
        const users = await User.find({ requestedContactIds: { $exists: true, $not: { $size: 0 } } }).lean();

        console.log("Fetched users:", users);

        if (users.length === 0) {
            return res.status(200).json({ message: 'No users with requested contacts found.' });
        }

        // Prepare a list to hold all individual requests
        let contactRequests = [];

        // Iterate through each user and their requested contact IDs
        await Promise.all(users.map(async (user) => {
            console.log(`Processing user: ${user.name} with requestedContactIds: ${user.requestedContactIds}`);
            const biodataRequests = await Promise.all(user.requestedContactIds.map(async (contactId) => {
                const biodata = await Biodata.findOne({ biodataId: contactId }).lean();
                console.log(`Fetched biodata for contactId ${contactId}:`, biodata);
                if (biodata) {
                    return {
                        requestId: new mongoose.Types.ObjectId(), // Generate a unique ID for the request
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        contactId: contactId,
                        contactName: biodata.name,
                        contactEmail: biodata.contactEmail,
                        contactMobileNumber: biodata.mobileNumber,
                    };
                }
                return null;
            }));
            contactRequests = contactRequests.concat(biodataRequests.filter(request => request !== null));
        }));

        console.log("Final contact requests:", contactRequests);

        res.status(200).json(contactRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching contact requests' });
    }
};

