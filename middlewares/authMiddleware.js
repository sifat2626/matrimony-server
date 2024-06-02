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