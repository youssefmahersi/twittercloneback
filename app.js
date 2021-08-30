const path = require('path');
const port = process.env.PORT || 8080;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const test = require("./utils/hometweets");
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);  
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
//middleware that handels file upload 
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
//serve images statisticly
app.use('/images', express.static(path.join(__dirname, 'images')));
//cros
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type',' Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
//routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
//error handler
app.use((error, req, res, next) => {
  
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
//database connection
mongoose
  .connect(
    // 'mongodb+srv://maximilian:9u4biljMQc4jjqbe@cluster0-ntrwp.mongodb.net/messages?retryWrites=true'
    "mongodb+srv://youssef23:youssef23@return.ek7z3.mongodb.net/twitterClone?retryWrites=true&w=majority",
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(result => {
    console.log("database connected!");
    app.listen(port);
  })
  .catch(err => console.log(err));
