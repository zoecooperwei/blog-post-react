const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

const refreshTokenSchema = new mongoose.Schema({
    token: String
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

// verify the refresh token expiration
// detect the refresh token re-use
// revoke the refresh token 
// create a new refresh token

module.exports = {
    RefreshToken: RefreshToken
}