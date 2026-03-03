const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    try {
        req.token = jwt.verify(token, process.env.JWT_KEY);
        next();
    }catch(e){
        return res.status(401).json({error: "Unauthorized"});
    }
}

module.exports = auth;