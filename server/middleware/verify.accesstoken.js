const jwt = require('jsonwebtoken');
const config = require("../config/auth.config");

// @desc Verify client side's resource requests 
const verifyAccessToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized token' }); // trigger log out
    };

    const access_token = authHeader.split(' ')[1]; // split into 'Bearer' and access token

    jwt.verify(
        access_token,
        config.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            // access token has expired: trigger refresh token
            if (err) return res.status(403).json({ message: 'Access token expired' }); 

            req.user = decoded.UserInfo.username; // differentiate the posts belong to different users
            next();
        }
    );
}

module.exports = verifyAccessToken;