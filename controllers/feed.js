const { validationResult } = require('express-validator');
const Post = require("../models/tweet");
const User = require("../models/user");
const Tweret = require("../models/tweret");
const timeDif = require("../utils/timeDif");
const Act = require("../models/act");
var tweetUpdate = require("../utils/tweetUpdate");
var arrayUpdate = require("../utils/arrayUpdate");
function formatDate(){
  
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  const date = new Date().getDate();
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  return `${year}/${month}/${date} ${hour}:${minutes}:${seconds}`;
}

exports.createTweet = async(req,res,next)=>{
  try{
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  var tweet;
  let imageurl;
  if (!req.file) {
     imageurl = "";
  }else{
     imageurl = req.file.path;
  }
  

  
  const user = await User.findById(req.userId);
  const users = await User.find();
  if(!user){
    const error = new Error('User not found !');
    error.statusCode = 422;
    throw error;
  }
  const public = req.body.privacy;
  const comment = req.body.comment;
  const post = new Post({
    comment: comment,
    imageUrl:imageurl,
    comments:[],
    likes:[],
    timeCreated : formatDate(),
    userId: req.userId,
    privacy: public,
    total : (user.followers.length * 100)/users.length,
    rank : ((user.followers.length * 100)/users.length)/Math.log(1.02),
    retweets : [],
    saves : []
  });
  const result1 = await post.save();
  const tweret = new Tweret({
    type : "tweet",
    creatorId : user._id.toString(),
    postId: post._id,
    time:formatDate(),
    privacy: public
  })
  
  const result2 = await tweret.save();
  const act = await Act.findOne({userId:req.userId});
  var newLike = {
    type :"tweet",
    id:post._id
  }
  var newActivities = act.activities;
  newActivities.push(newLike);
  act.activities = newActivities;

  const result3= await act.save();
  res.status(201).json({
    message: 'Post created successfully!'
  });
}
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
}
}

exports.getAll=async (req,res,next)=>{
    var following =[];
    var posts = [];
    var realPosts = [];
    try{
    const user = await User.findById(req.userId)
    following = user.following;
    const tweets = await Tweret.find();
    if(!tweets){
      const error = new Error('No posts');
      error.statusCode = 409;
      throw error;

    }else{
      for (let tweet of tweets){
        if(tweet.type == "tweet"){
          const check = following.find(follow => follow.userId.toString() === tweet.creatorId.toString());
          if(check){
            posts.push(tweet);
          }
        }else{
          const check = following.find(follow => follow.userId.toString()  === tweet.retweeterId.toString());
          if(check && tweet.privacy == false){
            posts.push(tweet);
          }
        }
      }
      for(let post of posts){
        const tweet = await Post.findById(post.postId)
        if(post.type == "tweet"){
          const b = {
            type: "tweet",
            tweet: tweet
          }
          realPosts.push(b);  
        }else{
          var s = await User.findById(post.creatorId);
          const a = {
            type: "retweet",
            tweet: tweet,
            status:s.username+" retweeted"
          }
          realPosts.push(a);
        }
      }
      realPosts.sort(function(a, b) {
        return b.rank - a.rank;
      }); 
      var xx = await tweetUpdate(realPosts);
      res.status(200).json({posts : xx});
            
    }
    }
    catch(err){
      if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);}
   
}


exports.getTweets = async(req,res,next)=>{
  const userId = req.params.userId;
  try{
    const user = await User.findById(req.userId);
    const check = user.following.find(use =>use.userId.toString()=== userId.toString());
    if(check){
      const tweets = await Post.find({userId });
      var xx = await tweetUpdate(tweets);
      res.status(200).json({tweets:xx}); 
    }else{
      if(userId === req.userId){
        const tweets = await Post.find({userId :req.userId });
        var xx = await tweetUpdate(tweets);
        res.status(200).json({
          tweets:xx
        });
      }else{
        const tweets = await Post.find({privacy:false,userId: userId});
        var xx = await tweetUpdate(tweets);
        res.status(200).json({
          tweets:xx
        }); 
      }
    }
  } 
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
}      
  
}




exports.searchUser = async(req,res,next)=>{
  const userId = req.params.userId;
  let utilisateur;
  try{
  const user = await User.findById(userId);
    if(!user){
      const error = new Error('Could not find user.');
        error.statusCode = 404;
        throw error;
    }
    var newFollowers = await arrayUpdate(user.followers);
    var newFollowing = await arrayUpdate(user.following);
    utilisateur = {
        username : user.username,
        email : user.email,
        following : newFollowing ,
        followers : newFollowers ,
        bio: user.bio,
        photoProf : user.photoProf ,
        photoCover : user.photoCover
      } 
    if(req.userId.toString() === userId.toString()){
      var posts = await Post.find({userId})
    } else{
      const checkFollowingUser = utilisateur.followers.find(follower => follower.userId.toString()=== req.userId.toString());
      if(checkFollowingUser){
        var posts = await  Post.find({userId : userId});
      }
      else{
        var posts = await  Post.find({userId : userId,public : true});
      }
    } 
    var xx = await tweetUpdate(posts);
    utilisateur.userPosts = xx;
    const act = await Act.findOne({userId:req.userId});
    var newAct = {
      type :"usersearch",
      id:req.params.userId
    }
    var newActivities = act.activities;
    newActivities.push(newAct);
    act.activities = newActivities;
  
    const result3= await act.save();
    res.status(200).json({
      message : "found what u are looking for !",
      user : utilisateur
    })
}
    catch(err   ){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.searchUsername = async(req,res,next)=>{
  const username = req.body.username;
  let  utilisateur;
  try{
    const user = await User.findById(req.userId);
    const lookingUser = await User.findOne({username});
    if(!lookingUser){
      const error = new Error('Could not find user.');
        error.statusCode = 404;
        throw error;
    }
    var newFollowers = await arrayUpdate(lookingUser.followers);
    var newFollowing = await arrayUpdate(lookingUser.following);
      utilisateur = {
        username : lookingUser.username,
        email : lookingUser.email,
        following : newFollowing ,
        followers : newFollowers,
        bio: lookingUser.bio,
        photoProf : lookingUser.photoProf ,
        photoCover : lookingUser.photoCover
      }
    if(user.username === lookingUser.username){
      var posts = await  Post.find({userId : lookingUser._id});
    }else{
      const checkFollowingUser = utilisateur.followers.find(follower => follower.userId.toString()=== req.userId.toString());
    if(checkFollowingUser){
      var posts = await  Post.find({userId : lookingUser._id});
    }else{
      var posts = await  Post.find({userId : lookingUser._id,public : true});
    }
    }
    
    var xx = await tweetUpdate(posts);
    utilisateur.userPosts = xx;
    const act = await Act.findOne({userId:req.userId});
    var newAct = {
      type :"usersearch",
      id:req.params.userId
    }
    var newActivities = act.activities;
    newActivities.push(newAct);
    act.activities = newActivities;
  
    const result3= await act.save();
    res.status(200).json({
      message : "found what u are looking for !",
      user : utilisateur
    })
}
    catch(err   ){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.followUser = (req,res,next)=>{
  const userId = req.userId;
  const followingId = req.body.followingId;
  if(userId == followingId){
      const error = new Error('not allowed!.');
      error.statusCode = 404;
      throw error;
  }
  var userInfo;
  var followingInfo;
  var state;
  User.findById(userId)
  .then(user =>{
    if(!user){
      const error = new Error('user not found1!.');
      error.statusCode = 404;
      throw error;
    }
    userInfo = user;
    return User.findById(followingId);
  })
  .then(following =>{
    if(!following){
      const error = new Error('following not found!.');
      error.statusCode = 404;
      throw error;
    }
    followingInfo = following;
    const checkuserfollow = following.followers.find(follower => follower.userId.toString()=== userId);
    if(checkuserfollow){
      //remove follower
      state = false;
      var newfollowers = following.followers.filter(follower => follower.userId.toString()!== userId);
      following.followers = newfollowers;
      return following.save();
    }else{
      //add follower
      state = true;
      following.followers.push({
        userId : userId,
        timeFollowed :formatDate()
      });
      return following.save();
    }
  })
  .then(result=>{
    return User.findById(userId);
  })
  .then(user=>{
    if(!user){
      const error = new Error('user not found2!.');
      error.statusCode = 404;
      throw error;
    }
    if(state){
      user.following.push({
        userId : followingInfo._id.toString(),
        timeFollowed : formatDate()
      })
      return user.save();
    }else{
      var newfollowing = user.following.filter(follow => follow.userId.toString() !== followingInfo._id.toString());
      user.following = newfollowing;
      return user.save();
    }
  })
  .then(result =>{
    res.status(200).json({message : "operation done successfully!"});
  })
  .catch(err =>{
    if (!err.statusCode) {
        err.statusCode = 500;
      }
    next(err);
  })

}





exports.getbookmarks = async(req,res,next)=>{
  try{
  const userId = req.userId;
  const user = await User.findById(userId);
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    var xx = await tweetUpdate(user.bookmarks);
    res.status(200).json({
      message : "succesfull fetch !",
      bookmarks : xx
    })
  }catch(err ){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
}


exports.likePost = async(req,res,next)=>{
  const userId = req.userId;
  const postId = req.body.postId;
  var userinfo;
  var state;
  try{

  
  const user = await User.findById(userId);
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    userinfo = user;
    const post = await Post.findById(postId);
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    const checkuserLike = post.likes.find(user => user.userId.toString()=== userId.toString());
    if(checkuserLike){
      const newlikes = post.likes.filter(user => user.userId.toString()!== userId.toString());
      state = false;
      post.likes = newlikes;
      const result = await  post.save();
      const act = await Act.findOne({userId:req.userId});
      var newActs = act.activities.filter(acte => {
        if(acte.id.toString()!=post._id.toString() && acte.type != "tweetLike"){
          return acte
        }});
      act.activities= newActs;
      const result3= await act.save();
    }else{
      var c = {
        userId : userId,
        username: user.username,
        pp : user.photoProf
      }
      post.likes.push({
        userId : userId
      })
      state= true;
      const result = await  post.save();
      const act = await Act.findOne({userId:req.userId});
      var newAct = {
        type :"tweetLike",
        id: post._id
      }
      var newActivities = act.activities;
      newActivities.push(newAct);
      act.activities = newActivities;
  
      const result3= await act.save();
    }
    if(state){
      res.status(200).json({message :"like added successfully",like: c});
    }else{
      res.status(200).json({message :"like deleted successfully"});
    }

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
}
}


exports.commentPost = async (req,res,next)=>{
  try{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const userId = req.userId;
  const postId = req.body.postId;
  const content = req.body.content;
  var userInfo;
  let commentImage;
  if (!req.file) {
    commentImage = "";
  }else{
    commentImage = req.file.path;
  }
  const user = await User.findById(userId);
  if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
  }
    userInfo=user;
    const post = await Post.findById(postId);
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    const a ={
      content : content,
      time :formatDate(),
      imageUrl : commentImage,
      userId : userId,
      username : user.username,
      pp:user.photoProf,
      likes :[]
    }
    post.comments.push({
      content : content,
      time :formatDate(),
      imageUrl : commentImage,
      userId : userId,
      likes :[]
    });
    const result = await post.save();
    const act = await Act.findOne({userId:req.userId});
    var newAct = {
      type :"tweetComment",
      id: post._id
    }
    var newActivities = act.activities;
    newActivities.push(newAct);
    act.activities = newActivities;

    const result3= await act.save();
    res.status(200).json({message : "comment added successfully!",comment : a});

  }catch(err ){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}


exports.likeComment = async(req,res,next)=>{
  try{
    const userId = req.userId;
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    var userInfo;
    const user = await User.findById(userId);
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    userInfo = user;
    const post = await  Post.findById(postId);
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    var lookedComment  = post.comments.find(comment => comment._id.toString() === commentId);
    var lookedcommentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
    if(lookedcommentIndex == -1){
      const error = new Error('comment not found!');
      error.statusCode = 404;
      throw error;
    }
    var like = lookedComment.likes.find(like => like.userId.toString() === userId);
    if(like){
      var newlikes = post.comments[lookedcommentIndex].likes.filter(like => like.userId.toString() !== userId);
      post.comments[lookedcommentIndex].likes = newlikes;
      var result =  post.save();
      const act = await Act.findOne({userId:req.userId});
      var newActs = act.activities.filter(acte => {
        if(acte.id.toString()!=post._id.toString() && acte.type != "commentLike"){
          return acte
        }});
      act.activities = newActs;
      const result3= await act.save();
      res.status(200).json({message : "like deleted successfully!"});
    }else{
      var a ={
        userId : userId,
        username : user.username,
        pp: user.photoProf
      }
      post.comments[lookedcommentIndex].likes.push({
        userId : userId
      });
      var result =  post.save();
      const act = await Act.findOne({userId:req.userId});
      var newAct = {
        type :"commentLike",
        id: post._id
      }
      var newActivities = act.activities;
      newActivities.push(newAct);
      act.activities = newActivities;
  
      const result3= await act.save();
      res.status(200).json({message : "like added successfully!",like:a});
    }
    
  }catch(err ){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.saveTweet = async(req,res,next)=>{

  const userId = req.userId;
  const postId = req.body.postId;
  try{
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    const checkuser = post.saves.find(user => user.toString()===userId.toString());
    if(checkuser){
      var newSaves = post.saves.filter(user => user.toString()!== userId.toString());
      post.saves= newSaves;
      const result = await post.save();
      var  newBookmarks = user.bookmarks.filter(save => save._id.toString()!== postId.toString());
      user.bookmarks = newBookmarks;
      const result2 = await user.save();
      const act = await Act.findOne({userId:req.userId});
      var newActs = act.activities.filter(acte => {
        if(acte.id.toString()!==post._id.toString() && acte.type != "tweetSave"){
          return acte
        }});
      act.activities = newActs;
      const result3= await act.save();
      res.status(200).json({message: "Tweet unsaved successfully !"});
    }else{
      post.saves.push(userId);
      const result1 = await post.save();
      
      if(!user){
        const error = new Error('user not found!');
        error.statusCode = 404;
        throw error;
      }
      const checkpostsaved = user.bookmarks.find(tweet => tweet._id=== postId);

        user.bookmarks.push(post);
        const result = await user.save();
        const act = await Act.findOne({userId:req.userId});
        var newAct = {
          type :"tweetSave",
          id: post._id
        }
        var newActivities = act.activities;
        newActivities.push(newAct);
        act.activities = newActivities;
        const result3= await act.save();
        res.status(200).json({message:"tweet saved successfuly!"});
           
    }
    
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.retweetPost = async(req,res,next)=>{
  const postId = req.body.postId;
  var userInfo;
  var tweet;
  try{
    const post = await Post.findById(postId);
    tweet = post;
    const user = await User.findById(req.userId);
    post.retweets.push({
      userId : req.userId,
      username : user.username
    });
    const res1 =await post.save();
    
    if(!user){
      const error = new Error('user not found');
      error.statusCode = 404;
      throw error;
    }
    userInfo = user;
    const checkPost = await user.retweet.find(post => post.postId === postId);
    if(checkPost){
      const error = new Error('Post alerady exists');
      error.statusCode = 409;
      throw error;
    }
    var newRetweet = {
      postId : postId,
      timeRetweeted : new Date()
    }
    user.retweet.push(newRetweet);
    const result1 = await user.save();
    const tweret = new Tweret({
      type : "retweet",
      creatorId : tweet.userId,
      creatorUsername: tweet.username,
      postId: tweet._id,
      time:formatDate(),
      privacy: tweet.privacy,
      retweeterId : userInfo._id,
      retweeterUsername: userInfo.username
    })
    const result = await  tweret.save();
    const act = await Act.findOne({userId:req.userId});
        var newAct = {
          type :"tweetRetweet",
          id: post._id
        }
        var newActivities = act.activities;
        newActivities.push(newAct);
        act.activities = newActivities;
        const result3= await act.save();
    res.status(200).json({message : "retweet added successfully!"});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.topTweets = async(req,res,next)=>{
  const userId = req.userId;
  var posts = [];
  try{
    const tweets = await Post.find();
    const user = await User.findById(userId);
    for(let tweet of tweets){
      if((tweet.privacy === false) && (tweet.userId.toString() !== userId.toString())){
      const postfollower = user.following.find(follower => follower.userId.toString() === tweet.userId.toString());
      if(!postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }
    var xx = await tweetUpdate(posts);

  }
  res.status(200).json({posts:xx});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}



exports.latestTweets = async (req,res,next)=>{
  const timeNow = new Date();
  const userId = req.userId;
  var posts = [];
  try{
    const tweets = await Post.find();
    const user = await User.findById(userId);
    ///overhere
    for(let tweet of tweets){
      if((tweet.privacy === false) && (timeDif(new Date(tweet.timeCreated),timeNow)<1) && (tweet.userId.toString() != userId.toString())){
      const postfollower = user.following.find(follower => follower.userId.toString() === tweet.userId.toString());
      if(!postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }
    var xx = await tweetUpdate(posts);

  }
  res.status(200).json({posts:xx});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}



exports.popularPeople = async(req,res,next)=>{
  const userId = req.userId;
  var popularUsers=[];
  const users = await User.find();
  const user = await User.findById(userId); 
  for(let use of users){
    if(use._id.toString()!== userId.toString()){
      const check = user.following.find(us => us.userId.toString() == use._id.toString());
      if(!check){
        var followers = await arrayUpdate(use.followers);
        var following = await arrayUpdate(use.following);
        use.followers= followers;
        use.following = following
        popularUsers.push(use);
      }
    }
  }
  popularUsers.sort(function(a, b) {
    return b.followers.length - a.followers.length;
  });
  
  res.status(200).json({users:popularUsers});

};

exports.tweetMedia = async(req,res,next)=>{
  const userId = req.userId;
  var posts = [];
  try{
    const tweets = await Post.find();
    const user = await User.findById(userId);
    for(let tweet of tweets){
      if((tweet.privacy === false) && (tweet.userId.toString() !== userId.toString())&& (tweet.imageUrl!== "") ){
      const postfollower = user.following.find(follower => follower.userId.toString() === tweet.userId.toString());
      if(!postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }
    var xx = await tweetUpdate(posts);

  }
  res.status(200).json({posts:xx});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}





