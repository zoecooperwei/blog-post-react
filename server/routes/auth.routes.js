const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifySignup = require("../middleware/verify.signup");

// @desc Register
// @route POST /auth/register
// @access Public
router.post("/register", [verifySignup.checkDuplicateUsername], authController.register);

// @desc Login
// @route POST /auth/login
// @access Public
router.post("/login", authController.login);

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
router.get("/refresh", authController.refresh);

// @desc Refresh
// @route POST /auth/forgotPassword
// @access Public - because user forgot password and need to verify the username first
router.post("/forgotPassword", authController.forgotPassword);

// @desc Refresh
// @route POST /auth/resetPassword
// @access Public - reset the password with verified username
router.post("/resetPassword", authController.resetPassword);

// @desc Log out
// @route POST /auth/logout
// @access Public
// router.post("/logout", authController.logout);

module.exports = router;