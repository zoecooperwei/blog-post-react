const express = require('express');
const app = express();
const userController = require("../controllers/user.controller");
const verifyAccessToken = require("../middleware/verify.accesstoken");
const router = express.Router();

router.use(verifyAccessToken);

router.get("/posts", userController.getPosts);

router.get("/post", userController.getPost);

router.get("/posts/search", userController.searchPost);

router.get("/posts/top", userController.getTopPost);

router.put("/post", userController.updatePost);

router.put("/post/image", userController.updatePostImage);

// @desc Create new post
// @route POST /user/posts/new
// @access Public
router.post("/posts/new", userController.postPost);

router.delete("/posts", userController.deletePost);

module.exports = router;