const { User } = require("../models/user.model");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { RefreshToken }  = require("../models/refreshtoken.model");

// @desc Register
// @route POST /auth/register
// @access Public
const register = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // check if username, password are all provided
    if(!username || !password) {
        return res.status(400).json({ message: "All fields required" });
    };

    const newUser = new User({
        username: username,
        password: bcrypt.hashSync(password)
    });

    newUser.save((err, user) => {
        if(err) {
            res.status(500).json({ message: "error" });
            return;
        }

        res.status(200).json({ message: "Registered success" });
    })
}

// @desc Login
// @route POST /auth/login
// @access Public
const login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // check if username, password are all provided
    if(!username || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    // find the user in db by checking username
    let foundUser;
    try {
        foundUser = await User.findOne({ username: username });
        if (!foundUser) {
            res.status(401).json({ message: "Username not found" });
            return;
        }
    } catch(err) {
        res.status(401).json({ message: "Username not found" });
        return;
    };

    // check password by using bcrypt
    try {
        let passwordMatch = await bcrypt.compare(password, foundUser.password);
        if(!passwordMatch) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
    } catch (err) {
        return res.status(500).json({ message: 'error' });
    }
    
    // create jwt access token
    let access_token = jwt.sign(
        { // payload
            "UserInfo": {
                "username": foundUser.username,
                "userid": foundUser._id
            }
        }, 
        config.ACCESS_TOKEN_SECRET, // secret key
        { // token expire time
            expiresIn: config.ACCESS_TOKEN_EXPIRE
        }
    );

    // create Refresh Token
    // refresh token is just a random string, so we can generate it via various ways
    // here we use jwt to help generate a random string for refresh token with expire time
    // we can also use uuid to generate a random string and set the expire time by ourselves

    // Create a new refresh token and save it in database
    let refresh_token = jwt.sign(
        {
            "username": foundUser.username
        },
        config.REFRESH_TOKEN_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRE
        }
    );

    // Create secure cookie with refresh token
    // res.cookie('refresh_token', refresh_token, { 
    //     expires: new Date(Date.now() + config.REFRESH_TOKEN_EXPIRE), // cookie expiration time to match refresh token
    //     httpOnly: true, // accessible only by web server
    //     secure: true, // https
    //     sameSite: "None", // cross-site cookie: restful api server and client app server are hosting on different sites, so here cross-site is allowed
    // });

    // return access token
    res.status(200).json({
        id: foundUser._id,
        username: foundUser.username,
        accessToken: access_token,
        refreshToken: refresh_token,
        message: 'Login success'
    });
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    // const cookies = req.cookies;
    // trigger log out
    // if (!cookies || !cookies.refresh_token) return res.status(401).json({ message: 'Unauthorized token' });

    // Verify Refresh Token in cookies because access token has expired
    // const refreshToken = cookies.refresh_token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized token' }); // trigger log out
    };

    const refreshToken = authHeader.split(' ')[1]; // split into 'Bearer' and refresh token

    jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        // verify expired refresh token: trigger log out
        if (err) {
            return res.status(403).json({ message: 'Refresh token expired' }); 
        };

        // verify re-used refresh token: trigger log out
        try {
            const foundRefreshToken = await RefreshToken.findOne({ token: refreshToken });
            if(!foundRefreshToken) { // refresh token is 1st time used, save it in database
                let saveToken = new RefreshToken({
                    token: refreshToken
                });
                saveToken.save((err, token) => {
                    if (err) {
                        res.status(500).json({ message: 'error' });
                    };
                });
            } else {
                // The refresh token is re-used: attackers exist
                // invalidate the refresh token family and return error
                RefreshToken.deleteMany({}, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'error' });
                    };
                    
                    return res.status(403).json({ message: 'Refresh token reuse' }); 
                });
            }
        } catch (err) {
            res.status(500).json({ message: 'error' });
            return;
        }

        // find the user
        let foundUser;
        try {
            foundUser = await User.findOne({ username: decoded.username });
            if (!foundUser) return res.status(500).json({ message: 'error' });
        } catch (err) {
            return res.status(500).json({ message: 'error' });
        }

        // issue a new access token with user info
        let access_token = jwt.sign(
            { // payload
                "UserInfo": {
                    "username": foundUser.username,
                    "userid": foundUser._id
                }
            }, 
            config.ACCESS_TOKEN_SECRET, // secret key
            { // token expire time
                expiresIn: config.ACCESS_TOKEN_EXPIRE
            }
        );

        // Refresh Rotation Stratefy: issue a new refresh token
        let refresh_token = jwt.sign(
            {
                "username": foundUser.username
            },
            config.REFRESH_TOKEN_SECRET,
            {
                expiresIn: config.REFRESH_TOKEN_EXPIRE
            }
        );

        // Update secure cookie with refresh token
        // res.cookie('refresh_token', refresh_token, { 
        //     expires: new Date(Date.now() + config.REFRESH_TOKEN_EXPIRE), // cookie expiration time to match refresh token
        //     httpOnly: true, // accessible only by web server
        //     secure: true, // https
        //     sameSite: 'None' // cross-site cookie: restful api server and client app server are hosting on different sites, so here cross-site is allowed
        // });

        // console.log(refresh_token);
        
        // return access token
        res.status(200).json({ 
            id: foundUser._id,
            username: foundUser.username,
            accessToken: access_token,
            refreshToken: refresh_token,
            message: 'Refresh success'
        });
    });
}

const forgotPassword = async (req, res) => {
    const username = req.body.username;
    // check if username is provided
    if(!username) {
        return res.status(400).json({ message: "All fields required" });
    }

    // find the user in db by checking username
    let foundUser;
    try {
        foundUser = await User.findOne({ username: username });
        if (!foundUser) {
            res.status(401).json({ message: "Username not found" });
            return;
        }
    } catch(err) {
        res.status(401).json({ message: "Username not found" });
        return;
    };

    res.status(200).json({ message: "Forgot password: username verified" });
}

const resetPassword = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // check if password are all provided
    if(!password) {
        return res.status(400).json({ message: "All fields required" });
    }

    // check password by using bcrypt
    let updatedData = { password: bcrypt.hashSync(password) };
    try {
        await User.findOneAndUpdate({ username: username }, updatedData, { new: true });
    } catch (err) {
        return res.status(500).json({ message: 'error' });
    }
    
    // return access token
    res.status(200).json({ message: 'Password reset success' });
}

// @desc Log out
// @route POST /auth/logout
// @access Public
// const logout = async (req, res) => {
//     // const cookies = req.cookies;
//     // if (!cookies || !cookies.refresh_token) return res.sendStatus(204); // No content
//     // clear cookies
//     // res.clearCookie('refresh_token', { 
//     //     httpOnly: true, // accessible only by web server
//     //     secure: true, // https
//     //     sameSite: 'None' // cross-site cookie: restful api server and client app server are hosting on different sites, so here cross-site is allowed 
//     // });
//     res.status(200).json({ message: 'Logout success' });
// }

module.exports = {
    register: register,
    login: login,
    refresh: refresh,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword
    // logout: logout
}