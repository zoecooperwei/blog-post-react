const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    // data: String,
    contentType: String,
    url: String
});

// Define a model 'Image' applying imageSchema
const Image = new mongoose.model("Image", imageSchema); // create colletion 'images' inside postsDB

module.exports = {
    Image: Image,
    imageSchema: imageSchema
}