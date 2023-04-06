const { Post } = require('../models/post.model');
const { Image } = require("../models/image.model");
const fs = require('fs');
const path = require('path');
const processFile = require("../middleware/imageUpload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("zoe-post-manage"); 

/**
 * below is for local disk storage for image upload
 */
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '/uploads'));
//     },
//     filename: (req, file, cb) => {
//         // console.log(file);
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ dest: "uploads/files" }).single('file');
//  single(form data file key from client side)
// var upload = multer({ storage: storage }).single('file');

const getPosts = async (req, res) => {
    // destructure page and limit and set default values
    const page = req.query.pageNum;
    const limit = req.query.limit;
    try {
        let docs = await Post.find({ username: req.user })
        // let docs = await Post.find()
        .limit(limit * 1) // the number of documents we want to retrieve
        .skip((page - 1) * limit) // the amount of documents we want to skip before retrieving our documents
        .exec();

        let count = await Post.find({ username: req.user }).countDocuments(); // the total amount of documents

        res.status(200).json({ 
            data: docs,
            totalPages: Math.ceil(count / limit), 
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
    }
}

const getPost = async (req, res) => {
    let queryObj = req.query;
    // path: "https://locahost:3001/posts?postId=_id"
    try {
        let doc = await Post.findOne({ _id: queryObj.postId });
        res.json({ data: doc });
    } catch(err) {
        console.error(err.message);
    }
}

const searchPost = async (req, res) => {
    let queryObj = req.query;
    // path: "https://locahost:3001/posts?search=searchString"
    // "i" to ignore case-sensitive
    let reg = new RegExp(queryObj.searchStr, 'i');
    try {
        let docs = await Post.find({ username: req.user, $or: [ { title: reg }, { tags: reg } ] });
        // console.log(docs);
        res.json({ data: docs });  // director, desp search: category
    } catch(err) {
        console.error(err.message);
    }
}

const getTopPost = async (req, res) => {
    let queryObj = req.query;
    try {
        let docs = await Post.find({ username: req.user });
        docs = docs.slice(0, queryObj.number);
        res.json({ data: docs });
    } catch(err) {
        console.error(err.message);
    }
}

// update post
const updatePost = async (req, res) => {
    // req.body: {key: val, key: val...} updated_data_obj
    try { 
        let updateData = req.body;
        updateData.username = req.user;
        updateData.createdAt = new Date();
        let updatedDoc = await Post.findOneAndUpdate({ _id: req.query.postId }, updateData, { new: true });
        res.json({ data: updatedDoc });
    } catch(err) {
        console.error(err.message);
    }
}

const updatePostImage = async (req, res) => {
    // req.body: {key: val, key: val...} updated_data_obj
    try {
        // Hei, body-parser[deprecated] / express does not handle multipart/form-data bodies,
        // express only handles application/json and application/x-www-form-urlencoded to access req.body
        // but multer as the middleware does. 
        // That's why we can only get access to req.body or req.file inside the upload function.
        // console.log("upload sucess", req.body, req.file);
        await processFile(req, res);
    
        if (!req.file) {
          return res.status(400).send({ message: "Please upload a file!" });
        }
    
        // Create a new blob in the bucket and upload the file data.
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
    
        blobStream.on("error", (err) => {
            res.status(500).send({ message: err.message });
        });
    
        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
    
            try {
                // Make the file public
                await bucket.file(req.file.originalname).makePublic();
            } catch {
                return res.status(500).send({
                    message:
                        `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
                    url: publicUrl,
                });
            }

            let updateData = {
                image: new Image({
                    contentType: 'image/png',
                    url: publicUrl
                })
            };
            let updatedDoc = await Post.findOneAndUpdate({ _id: req.query.postId }, updateData, { new: true });        
            res.status(200).json({
                message: "Updated the image success",
                data: updatedDoc
            });
        });
    
        blobStream.end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
    // processFile(req, res, async (err) => {
    //     if (err instanceof multer.MulterError) {
    //         // return res.status(500).json(err);
    //         console.error("multer error");
    //     } else if (err) {
    //         console.error("upload error");
    //     };

    //     try { 
    //         let filePath = req.file.path;
    //         fs.readFile(filePath, async (err, data) => {
    //             if(err) {
    //                 throw err;
    //             };

    //             let url = "";
    //             if(data.toString('base64')) {
    //                 url = 'data:image/jpeg;base64,' + data.toString('base64');
    //             };

    //             let updateData = {
    //                 image: new Image({
    //                     data: url,
    //                     contentType: 'image/png',
    //                     src: filePath
    //                 })
    //             };
    //             let updatedDoc = await Post.findOneAndUpdate({ _id: req.query.postId }, updateData, { new: true });
    //             res.json({ data: updatedDoc });
    //         });
    //     } catch(err) {
    //         console.error(err.message);
    //     }
    // });
}

// post post
const postPost = async (req, res) => {
    try {
        // Hei, body-parser[deprecated] / express does not handle multipart/form-data bodies,
        // express only handles application/json and application/x-www-form-urlencoded to access req.body
        // but multer as the middleware does. 
        // That's why we can only get access to req.body or req.file inside the upload function.
        // console.log("upload sucess", req.body, req.file);
        await processFile(req, res);
    
        if (!req.file) {
          return res.status(400).send({ message: "Please upload a file!" });
        }
    
        // Create a new blob in the bucket and upload the file data.
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
    
        blobStream.on("error", (err) => {
            res.status(500).send({ message: "error" });
        });
    
        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
    
            try {
                // Make the file public
                await bucket.file(req.file.originalname).makePublic();
            } catch {
                return res.status(500).send({ message: `File public access denied` });
            }

            let newPost = new Post({
                username: req.user,
                title: req.body.title,
                desp: req.body.desp,
                tags: req.body.tags,
                rating: req.body.rating,
                image: new Image({
                    contentType: 'image/png',
                    url: publicUrl,
                }),
                createdAt: new Date()
            }); // follow postSchema
            let newDoc = await Post.create(newPost);
            res.status(200).json({
                message: "Created the post success",
                data: newDoc
            });
        });
    
        blobStream.end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
            message: `error`,
        });
    }
    // processFile(req, res, async (err) => {
    //     if (err instanceof multer.MulterError) {
    //         // return res.status(500).json(err);
    //         console.error("multer error");
    //     } else if (err) {
    //         console.error("upload error");
    //     }
    //     // Hei, body-parser[deprecated] / express does not handle multipart/form-data bodies,
    //     // express only handles application/json and application/x-www-form-urlencoded to access req.body
    //     // but multer as the middleware does. 
    //     // That's why we can only get access to req.body or req.file inside the upload function.
    //     // console.log("upload sucess", req.body, req.file);

    //     try { 
    //         let filePath = req.file.path;
    //         fs.readFile(filePath, async (err, data) => {
    //             if(err) {
    //                 throw err;
    //             };
    //             let url = "";
    //             if(data.toString('base64')) {
    //                 url = 'data:image/jpeg;base64,' + data.toString('base64');
    //             };

    //             let newPost = new Post({
    //                 username: req.user,
    //                 title: req.body.title,
    //                 // year: req.body.year,
    //                 // director: req.body.director,
    //                 desp: req.body.desp,
    //                 tags: req.body.tags,
    //                 rating: req.body.rating,
    //                 // image only can be stored in server NOT in database
    //                 // we can only store some related info in database
    //                 // here the image will be stored in server, under /uploads folder.
    //                 image: new Image({
    //                     data: url,
    //                     contentType: 'image/png',
    //                     src: filePath
    //                 }),
    //                 createdAt: new Date()
    //             }); // follow postSchema
    //             let new_doc = await Post.create(newPost);
    //             res.json({ data: new_doc });
    //         })
    //     } catch(err) {
    //         console.error(err.message);
    //     }
    // });
}

// delete post
const deletePost = (req, res) => {
    Post.deleteOne({ _id: req.query.postId }, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            res.status(200).json({ postId: req.query.postId });
        }
    })
}

module.exports = {
    getPosts: getPosts,
    getPost: getPost,
    searchPost: searchPost,
    getTopPost: getTopPost,
    updatePost: updatePost,
    updatePostImage: updatePostImage,
    postPost: postPost,
    deletePost: deletePost
}