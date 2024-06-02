const jwt = require('jsonwebtoken');

exports.createToken = (req, res) => {
    const user = req.body
    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '365d'})
    console.log(token)
    res.cookie('token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        sameSite: process.env.NODE_ENV==='production' ? 'none':'strict',
    }).send({success:true})
}

exports.clearCookie = (req, res) => {
    res.clearCookie('token',{
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        sameSite: process.env.NODE_ENV==='production' ? 'none':'strict',
        maxAge:0
    }).send({success:true})
}