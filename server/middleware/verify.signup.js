const { User } = require("../models/user.model");

// @desc Verify duplicate username registration 
const checkDuplicateUsername = async (req, res, next) => {
    // check if username already exists
    try {
        let foundUser = await User.findOne({ username: req.body.username });
        if (foundUser) return res.status(400).json({ message: 'Duplicate user' });
    } catch (err) {
        return res.status(500).json({ message: 'error' });
    };

    next();
}

module.exports = {
    checkDuplicateUsername: checkDuplicateUsername
}