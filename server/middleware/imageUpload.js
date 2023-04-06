const util = require("util");
const Multer = require("multer");
const maxSize = 2 * 1024 * 1024;

let storage = Multer.memoryStorage();
let processFile = Multer({
  storage: storage,
  limits: { fileSize: maxSize } // Restrict file size before uploading to GCS
}).single("file");

let processFileMiddleware = util.promisify(processFile);
module.exports = processFileMiddleware;