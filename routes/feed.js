const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../utils/is-auth");
const { body } = require('express-validator');

router.get("/followers-posts",isAuth,feedController.followerspost);
router.post("/create-tweet",[
    body("comment").trim().isLength({min:4}).withMessage("minuimum 4 characters")
],isAuth,feedController.createTweet);

router.post("/follow-user",isAuth,feedController.followUser);
router.post("/unfollow-user",isAuth,feedController.unfollowUser);
router.post("/like-post",isAuth,feedController.likePost);
router.post("/comment-post",isAuth,[
    body("content").isLength({min:4}).withMessage("minuimum 4 characters")
],feedController.commentPost);
router.get("/bookmarks",isAuth,feedController.getbookmarks);
router.get("/:userId",isAuth,feedController.searchUser);
module.exports = router;
