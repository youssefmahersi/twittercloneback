const express = require("express");
 
const router = express.Router();
const User = require("../models/user");
const { body } = require('express-validator');
const authController = require("../controllers/auth");


router.put("/signup",[
    body("username").trim().notEmpty()
    .withMessage('username is required')
    .not()
    .custom((val) => /[^A-za-z0-9\s]/g.test(val))
    .withMessage('Username not use uniqe characters')
    .isLength({min:4})
    .withMessage("username must contain at least  4 characters "),
    body("email").isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-Mail address already exists!');
        }
      });
    })
    .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage("password must contain at least 5 characters"),
],authController.signup);


router.post("/login",authController.login);

module.exports = router;



