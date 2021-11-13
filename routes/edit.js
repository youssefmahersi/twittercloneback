const express = require("express");
const router = express.Router();
const editController = require("../controllers/edit");
const isAuth = require("../utils/is-auth");
const { body } = require('express-validator');
const User = require("../models/user");
router.put("/pp",isAuth,editController.photoProfil);
router.put("/cp",isAuth,editController.photoCoverture);
router.put("/user-info",isAuth,[
  body("bio").trim().isLength({min:10})
  .withMessage("bio must contain at least  10 characters "),
    body("username").trim().notEmpty()
    .withMessage('username is required')
    .not()
    .custom((val) => /[^A-za-z0-9\s]/g.test(val))
    .withMessage('Username not use uniqe characters')
    .isLength({min:4})
    .withMessage("username must contain at least  4 characters ")
    .custom((value, { req }) => {
      return User.findOne({ username: value }).then(userDoc => {
        if (userDoc && (userDoc._id!= req.userId)) {
          return Promise.reject('Username already exists!');
        }
      });
    }),
    body('password')
      .trim()
],editController.editUser);


module.exports = router;
