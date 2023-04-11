const util = require("util");
const Multer = require("multer");
const maxSize = 2 * 1024 * 1024;

// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
let storage = Multer.memoryStorage();
let processFile = Multer({
  storage: storage,
  limits: { fileSize: maxSize } // Restrict file size before uploading to GCS
}).single("file");

let processFileMiddleware = util.promisify(processFile);
module.exports = processFileMiddleware;