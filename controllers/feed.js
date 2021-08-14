const { validationResult } = require('express-validator');
const Post = require("../models/tweet");
const User = require("../models/user");


exports.followerspost = (req,res,next)=>{
    const userId = req.userId;
    let posts =[];
    let followers =[
      {
        userId : "6116d9f6685b3a2144195fc0",
        username : "youssef"
      }
    ];
    User.findById(userId)
    .then(user =>{
        if(!user){
            const error = new Error('user not found!!');
            error.statusCode = 401;
            throw error;
        }
        followers = user.following;
        return Post.find()
    })
    .then(tweets => {
      
        if(!tweets){
            const error = new Error('posts not found!!');
            error.statusCode = 401;
            throw error;
        }
        for(let tweet of tweets){
            const postfollower = followers.find(follower => follower.userId ==tweet.userId );
            if(postfollower){
                posts.push(tweet);
            }
        }
        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts
          });


    })
    .catch(err =>{
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    })
};



exports.createTweet = (req,res,next)=>{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  let imageurl;
  if (!req.file) {
     imageurl = "";
  }else{
     imageurl = req.file.path;
  }
  consol.log(req.file)
  const comment = req.body.comment;
  const post = new Post({
    comment: comment,
    imageUrl:imageurl,
    retweet:[],
    comments:[],
    likes:[],
    userId: req.userId
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}