const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../utils/is-auth");
const { body } = require('express-validator');

router.get("/followers-posts",isAuth,feedController.createTweet2);
router.post("/create-tweet",[
    body("comment").trim().isLength({min:4}).withMessage("minuimum 4 characters")
],isAuth,feedController.createTweet);
//routes in search page
router.get("/top-tweets",isAuth,feedController.topTweets);
router.get("/latest-tweets",isAuth,feedController.latestTweets);
router.get("/popular-people",isAuth,feedController.popularPeople);
router.get("/tweet-media",isAuth,feedController.tweetMedia);
router.post("/follow-user",isAuth,feedController.followUser);
// router.post("/unfollow-user",isAuth,feedController.unfollowUser);
router.post("/like-post",isAuth,feedController.likePost);
router.post("/save-tweet",isAuth,feedController.saveTweet);
router.post("/comment-post",isAuth,[
    body("content").isLength({min:4}).withMessage("minuimum 4 characters")
],feedController.commentPost);
router.post("/retweet-post",isAuth,feedController.retweetPost);
router.post("/like-comment",isAuth,feedController.likeComment);
router.get("/bookmarks",isAuth,feedController.getbookmarks);

router.get("/:userId",isAuth,feedController.searchUser);
module.exports = router;
