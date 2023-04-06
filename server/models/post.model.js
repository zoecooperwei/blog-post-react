const mongoose = require('mongoose');
const { imageSchema } = require("./image.model");

const postSchema = mongoose.Schema({
    username: String,
    title: {
        type: String,
        required: [true, 'The post title is required']
    },
    desp: String,
    tags: [String],
    rating: {
        type: Number,
        min: 1,
        max: 10
    },
    image: imageSchema,
    createdAt: {
        type: Date,
        default: new Date()
    }
});

// Define a model 'Post' applying postSchema
const Post = mongoose.model("Post", postSchema); // create colletion 'posts' inside postsDB

module.exports = {
    Post: Post
}