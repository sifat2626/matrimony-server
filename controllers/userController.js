const User = require('../models/userModel');
const Biodata = require('../models/bioDataModel');
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
    try {
        const { email, name, biodataId } = req.body; // Ensure biodataId is included if needed
        console.log(`Email: ${email}, Name: ${name}, BiodataId: ${biodataId}`);

        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required.' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json(existingUser);
        }

        // Create a new user
        console.log('Creating new user...');
        const newUser = new User({ email, name });

        // If biodataId is provided, associate it with the user
        if (biodataId) {
            newUser.biodata = biodataId;
        }

        const savedUser = await newUser.save();
        console.log('User created successfully:', savedUser);

        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search = '' } = req.query;

        // Construct the search query
        const searchQuery = search
            ? {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        // Fetch the users with pagination and search
        const users = await User.find(searchQuery)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize))
            .lean();

        // Get the total count of users matching the search query
        const totalUsers = await User.countDocuments(searchQuery);

        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        res.status(200).json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / pageSize),
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
};

exports.getUser = async (req, res) => {
    try {
        const {email} = req.user
        const user = await User.findOne({ email });

        res.status(200).json({
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
};

exports.requestPremium = async (req, res) => {
    const { email } = req.user;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            { email },
            {premiumStatus: 'Requested'}
        );

        res.status(200).json({ message: 'Premium Status requested successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while requesting Premium Status' });
    }
};
exports.allPremiumRequests = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, search = "" } = req.query;

        const query = {
            premiumStatus: "Requested",
            ...(search && { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }),
        };

        const users = await User.find(query)
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .lean();

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / pageSize);

        // Change the response for no users found
        if (!users.length) {
            return res.status(200).json({
                users: [],
                totalPages: 0,
                currentPage: Number(page),
                totalUsers: 0,
                message: "No users found with requested premium status."
            });
        }

        res.status(200).json({
            users,
            totalPages,
            currentPage: Number(page),
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching users." });
    }
};
exports.allPremiumUsers = async (req, res) => {
    try {
        const premiumUsers = await User.find({ premiumStatus: 'Premium' });
        res.status(200).json({ premiumUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching users." });
    }
};


exports.requestContact = async (req, res) => {
    const { biodataId } = req.params;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            { email: req.user.email },
            { $addToSet: { requestedContactIds: { biodataId: biodataId, requestTime: new Date() } } }, // Add object to the array if it doesn't already exist
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ message: 'Contact requested successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while requesting contact' });
    }
};


exports.acceptContact = async (req, res) => {
    const { email, biodataId } = req.params;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            { email },
            {
                // Remove the requested contact object from the array
                $pull: { requestedContactIds: { biodataId: Number(biodataId) } },
                // Add the biodataId to the approved contacts array
                $addToSet: { approvedContactIds: Number(biodataId) }
            },
            { new: true, useFindAndModify: false }
        );
        res.status(200).json({ message: 'Contact accepted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while accepting contact' });
    }
};
exports.rejectContact = async (req, res) => {
    const { email, biodataId } = req.params;

    try {
        // Find and update the user
        await User.findOneAndUpdate(
            { email },
            {
                // Remove the requested contact object from the array
                $pull: { requestedContactIds: { biodataId: Number(biodataId) } },

            },
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while rejecting contact' });
    }
};

exports.requestedContacts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        // Fetch all users who have made contact requests
        const users = await User.find({ "requestedContactIds.0": { $exists: true } }).lean(); // Check for non-empty arrays

        console.log("Fetched users:", users);

        if (users.length === 0) {
            return res.status(200).json({ message: 'No users with requested contacts found.' });
        }

        // Prepare a list to hold all individual requests
        let contactRequests = [];

        // Iterate through each user and their requested contact IDs
        await Promise.all(users.map(async (user) => {
            console.log(`Processing user: ${user.name} with requestedContactIds: ${user.requestedContactIds}`);
            const biodataRequests = await Promise.all(user.requestedContactIds.map(async (request) => {
                const biodata = await Biodata.findOne({ biodataId: request.biodataId }).lean();
                console.log(`Fetched biodata for contactId ${request.biodataId}:`, biodata);
                if (biodata) {
                    return {
                        requestId: new mongoose.Types.ObjectId(), // Generate a unique ID for the request
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        contactId: request.biodataId,
                        contactName: biodata.name,
                        contactEmail: biodata.contactEmail,
                        contactMobileNumber: biodata.mobileNumber,
                        requestTime: request.requestTime // Include the request time
                    };
                }
                return null;
            }));
            contactRequests = contactRequests.concat(biodataRequests.filter(request => request !== null));
        }));

        // Sort the requests by the requestTime in descending order
        contactRequests.sort((a, b) => b.requestTime - a.requestTime);

        // Implement pagination
        const totalRequests = contactRequests.length;
        const totalPages = Math.ceil(totalRequests / pageSize);
        const paginatedRequests = contactRequests.slice((page - 1) * pageSize, page * pageSize);

        console.log("Final contact requests:", paginatedRequests);

        res.status(200).json({
            totalRequests,
            totalPages,
            currentPage: page,
            pageSize,
            contactRequests: paginatedRequests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching contact requests' });
    }
};

exports.requestedContactsByUser = async (req, res) => {
    const { email } = req.user;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        // Fetch the user by email
        const user = await User.findOne({ email }).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.requestedContactIds || user.requestedContactIds.length === 0) {
            return res.status(200).json({ message: 'No requested contacts found for this user.' });
        }

        // Prepare a list to hold all individual requests
        let contactRequests = [];

        // Iterate through the user's requested contact IDs
        const biodataRequests = await Promise.all(user.requestedContactIds.map(async (request) => {
            const biodata = await Biodata.findOne({ biodataId: request.biodataId }).lean();
            if (biodata) {
                return {
                    requestId: new mongoose.Types.ObjectId(), // Generate a unique ID for the request
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    contactId: request.biodataId,
                    contactName: biodata.name,
                    contactEmail: biodata.contactEmail,
                    contactMobileNumber: biodata.mobileNumber,
                    requestTime: request.requestTime // Include the request time
                };
            }
            return null;
        }));

        contactRequests = biodataRequests.filter(request => request !== null);

        // Sort the requests by the requestTime in descending order
        contactRequests.sort((a, b) => b.requestTime - a.requestTime);

        // Implement pagination
        const totalRequests = contactRequests.length;
        const totalPages = Math.ceil(totalRequests / pageSize);
        const paginatedRequests = contactRequests.slice((page - 1) * pageSize, page * pageSize);

        console.log("Final contact requests:", paginatedRequests);

        res.status(200).json({
            totalRequests,
            totalPages,
            currentPage: page,
            pageSize,
            contactRequests: paginatedRequests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching contact requests for the user' });
    }
};


exports.getRole = async (req,res) => {
    const user = await User.findOne({email:req.user.email});
    const role = user.role;
    try{
        res.status(200).json(role);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching role' });
    }
}

exports.getApprovedContactsByUser = async (req, res) => {
    const { email } = req.user;

    try {
        // Find the user by email
        const user = await User.findOne({ email }).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Extract the approvedContactIds
        const approvedContactIds = user.approvedContactIds;

        console.log(`Approved contacts for user ${email}:`, approvedContactIds);

        res.status(200).json({ approvedContactIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching approved contacts.' });
    }
};
exports.getApprovedContactsForAllUsers = async (req, res) => {
    try {
        // Find all users
        const users = await User.find({}, 'email approvedContactIds').lean();

        if (!users) {
            return res.status(404).json({ message: 'No users found.' });
        }

        // Map users to get their email and approved contacts
        const userContacts = users.map(user => ({
            email: user.email,
            approvedContactIds: user.approvedContactIds,
        }));

        console.log('Approved contacts for all users:', userContacts);

        res.status(200).json({ userContacts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching approved contacts for all users.' });
    }
};
exports.getRevenueCount = async (req, res) => {
    try {
        // Find all users
        const users = await User.find({}, 'approvedContactIds').lean();

        if (!users) {
            return res.status(404).json({ message: 'No users found.' });
        }

        // Calculate the total number of approved contacts
        const totalApprovedContacts = users.reduce((acc, user) => acc + user.approvedContactIds.length, 0);

        // Calculate the revenue
        const revenue = totalApprovedContacts * 5;

        console.log('Total approved contacts:', totalApprovedContacts);
        console.log('Total revenue:', revenue);

        res.status(200).json({ totalApprovedContacts, revenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while calculating the revenue.' });
    }
};

exports.allContactsByUser = async (req, res) => {
    const { email } = req.user;

    try {
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let allRequests = [];

        // Process pending requests
        for (const request of user.requestedContactIds) {
            allRequests.push({
                name:'N/A',
                biodataId: request.biodataId,
                status: 'pending',
                requestTime: request.requestTime, // Include the request time
                mobileNumber:'N/A',
                contactEmail:'N/A'
            });
        }

        // Process approved requests
        for (const approvedId of user.approvedContactIds) {
            const biodata =await Biodata.find({biodataId:approvedId})
            allRequests.push({
                name:biodata.name,
                biodataId: approvedId,
                status: 'approved',
                mobileNumber:biodata.mobileNumber,
                contactEmail:biodata.contactEmail
            });
        }

        res.status(200).json({ allRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching all contact requests.' });
    }
};
exports.removeContact = async (req, res) => {
    try {
        const { email } = req.user;
        const { biodataId } = req.params;

        // Ensure biodataId is a number, assuming that's the type stored
        const biodataIdNumber = Number(biodataId);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.requestedContactIds = user.requestedContactIds.filter(request => request.biodataId !== biodataIdNumber);

        await user.save(); // Save the updated user object

        res.status(200).json({ message: "Contact removed from requests." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while removing the contact request.' });
    }
};
exports.updatePremium = async (req,res)=>{
    try{
        const {id}= req.params;
        const {status} = req.body
        console.log(status)
        const user =await User.findByIdAndUpdate(id,{premiumStatus:status})
        res.status(200).json({message:"Premium updated"});
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while making user premium.' });
    }
}

exports.updateRole = async (req,res)=>{
    try{
        const {id}= req.params;
        const {role} = req.body
        const user =await User.findByIdAndUpdate(id,{role})
        res.status(200).json({message:"Role updated"});
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating user role.' });
    }
}