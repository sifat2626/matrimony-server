const User = require('../models/userModel');

const jwt = require("jsonwebtoken");
exports.verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if(!token) return res.status(403).send('No token provided')
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).send('wrong token')
            }
            req.user = decoded
            next()
        })
    }

    console.log(token)
}

exports.isAdmin = async (req, res, next) => {
    const email = req.user.email;

    try {
        const user = await User.find({email});
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admins only.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while checking admin privileges' });
    }
};