const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./routes/auth.routes');
const post = require('./routes/user.routes');

if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  app.use(express.static(path.join(__dirname + './client/build')));

  // Express serve up index.html file if it doesn't recognize route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client', 'build', 'index.html'));
  });
}

// for POST data, Express parse data to readable req body based on the client's POST request header's content-type
// otherwise the req body will be empty/undefined
// for formData, express is UNABLE to handle 'multipart/form-data'
// we need to use multer upload api to access req.body and req.file
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// CORS configuration
// app.use(cors());
app.use(cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
}));

// Database connection
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-zoe:zoe0730@cluster0.khdwfmh.mongodb.net/postsDB");

/**
 * @param {string} request_url
 * @param {callback} - Tell the server what have to do when request happens
 */
// route: app.METHOD(PATH, HANDLER)
// http://www.google.com/hi/there?qs1=you&qs2=tube
// req.params: is portion of the path url, which is included in url
// path: '/hi:param1', req.params: { param1: 'there' }
// req.query: is not in path url, and it's after '?'
// path: '/hi/there',  req.query: { qs1: 'you', qs2: 'tube' }

app.use('/auth', auth);
app.use('/user', post);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3002;
}
app.listen(port, () => { console.log("Server starts on port " + port) });

// npx nodemon server.js to achieve hot reloading [auto-restart the nodejs based app when file changes are detected]