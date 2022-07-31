const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const path = require("path");
const Act = require("../models/act");

require('dotenv').config()

exports.signup = async (req, res, next) => {
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
        username :username,
        email: email,
        password: hashedPw,
        tweets :[],
        following:[],
        followers:[],
        bookmarks:[],
        retweet :[],
        photoCover :null,
        photoProf: null,
    });
    const result = await  user.save();
    const act = new Act({
      userId : user._id,
      activities:[]
    })

    const result2 = await act.save();

    res.status(201).json({ message: 'User created!', userId: result._id });

  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
}
  };

  exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString()
          },
          process.env.SECRET_HASHING_KEY,
          { expiresIn: '24h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString(),username:loadedUser.username,auth:true,pp:loadedUser.photoProf });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  