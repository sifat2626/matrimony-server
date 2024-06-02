const User = require('../models/userModel');

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

