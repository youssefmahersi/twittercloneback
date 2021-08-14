const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../utils/is-auth");
const { body } = require('express-validator');

router.get("/followers-posts",isAuth,feedController.followerspost);
router.post("/create-tweet",[
    body("comment").trim().isLength({min:4}).withMessage("minuimum 4 characters")
],isAuth,feedController.createTweet);

module.exports = router;
