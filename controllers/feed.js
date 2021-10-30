const { validationResult } = require('express-validator');
const Post = require("../models/tweet");
const User = require("../models/user");
const Tweret = require("../models/tweret");
const timeDif = require("../utils/timeDif");

function formatDate(){
  
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  const date = new Date().getDate();
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  return `${year}/${month}/${date} ${hour}:${minutes}:${seconds}`;
}

// exports.followerspost = async(req,res,next)=>{
//   const userId = req.userId;
//   let posts =[];
//   let followers = [];
//   try{
//       const user = await User.findById(userId);
//       if(!user){
//         const error = new Error('user not found!!');
//         error.statusCode = 401;
//         throw error;
//       }
//       followers = user.following;
//       const tweets = await Post.find()
//       if(!tweets){
//         const error = new Error('posts not found!!');
//         error.statusCode = 401;
//         throw error;
//       }
//       for(let tweet of tweets){
//         const postfollower = await followers.find(follower => follower.userId.toString() === tweet.userId.toString());
//         if(postfollower){
//         posts.push(tweet);
//       }
//     }
    
//     res.status(200).json({
//       message: 'Fetched posts successfully.',
//       posts: posts
//     });

//   }
//   catch(err){
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
    
// };



exports.createTweet = async(req,res,next)=>{
  try{
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  var tweet;
  var userInfo;
  let imageurl;
  if (!req.file) {
     imageurl = "";
  }else{
     imageurl = req.file.path;
  }
  

  
  const user = await User.findById(req.userId)
  const users = await User.find();
  userInfo=user;
  const public = req.body.audience;
  const comment = req.body.comment;
  const post = new Post({
    comment: comment,
    imageUrl:imageurl,
    comments:[],
    likes:[],
    timeCreated : formatDate(),
    userId: req.userId,
    username : user.username,
    privacy: public,
    total : (user.followers.length * 100)/users.length,
    rank : ((user.followers.length * 100)/users.length)/Math.log(1.02),
    retweets : [],
    saves : []
  });
  console.log(user.followers.length)
  console.log((user.followers.length * 100)/users.length)
  tweet = post
  const result1 = await post.save()
  const tweret = new Tweret({
    type : "tweet",
    creatorId : userInfo._id.toString(),
    creatorUsername: userInfo.username,
    postId: tweet._id,
    time:formatDate(),
    privacy: req.body.public
  })
  
  const result2 = await tweret.save();
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
      const error = new Error('Post alerady exists');
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
          const a = {
            type: "retweet",
            tweet: tweet,
            status:post.retweeterUsername+" retweeted"
          }
          realPosts.push(a);
        }
      }
            
      res.status(200).json({posts : realPosts});
            
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
    const tweets = await Post.find({userId });
    console.log(tweets);
    res.status(200).json({
      tweets
    });
  } 
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
}      
  
}




exports.searchUser = (req,res,next)=>{
  const userId = req.params.userId;
  let utilisateur;
  User.findById(userId)
  .then(user =>{
    if(!user){
      const error = new Error('Could not find user.');
        error.statusCode = 404;
        throw error;
    }
    if(req.userId == userId){
      utilisateur = user;

    }else{
      utilisateur = {
        username : user.username,
        email : user.email,
        following : user.following,
        followers : user.followers,
        bio: user.bio,
        photoProf : user.photoProf ,
        photoCover : user.photoCover
      }
    }
    
    const checkFollowingUser = utilisateur.followers.find(follower => follower.userId.toString()=== req.userId.toString());
    if(checkFollowingUser){
      return Post.find({userId : userId});
    }else{
      return Post.find({userId : userId,public : true});
    }
  })
  .then(posts =>{
    if(!posts){
      const error = new Error('Could not find posts.');
        error.statusCode = 404;
        throw error;
    }
    utilisateur.userPosts = posts;
    res.status(200).json({
      message : "found what u are looking for",
      user : utilisateur
    })
  })
  .catch(err =>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}


// exports.followUser = (req,res,next)=>{
//   const userId = req.userId;
//   const followingId = req.body.userId;
//   let followerUser;
//   let user2;
//   var checkUserfollowed ;
//   User.findById(userId)
//   .then(user =>{
//     if(!user){
//       const error = new Error('Could not find user.');
//         error.statusCode = 404;
//         throw error;
//     }
//     followerUser=user;
//     return User.findById(followingId)
//   })
//   .then(user =>{
//     if(!user){
//       const error = new Error('Could not find following user.');
//         error.statusCode = 404;
//         throw error;
//     }
//     checkUserfollowed = user.followers.find(follower => follower.userId.toString() === followerUser._id.toString());
//     if(!checkUserfollowed ){
//       user2= user;
//       user.followers.push({
//         userId : followerUser._id,
//         username : followerUser.username
//       })
//       return user.save();
//     }
//     const error = new Error('alerady followed user.');
//     error.statusCode = 404;
//     throw error;
//   })

//   .then(result =>{
//     User.findById(req.userId)
//     .then(user =>{
//       user.following.push({
//         userId : user2._id,
//         username : user2.username
//       })
//       return user.save();
//     })  
//     .then(result =>{
//       res.status(200).json({message : "following added succesfully"});
//         })  
    
//   })
//   .catch(err =>{
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   })
// }

// exports.unfollowUser = (req,res,next)=>{
//   const followingId = req.body.followingId;
//   User.findById(req.userId)
//   .then(user =>{
//     if(!user){
//       const error = new Error('alerady followed user.');
//       error.statusCode = 404;
//       throw error;
//     }
//     const newFollowings = user.following.filter(follow => follow.userId.toString() !== followingId);
//     user.following = newFollowings;
//     return user.save();
//   })
//   .then(result =>{
//     console.log(followingId);
//     return User.findById(followingId)
    
//   })
//   .then(user => {
//     const newFollowers = user.followers.filter(follow => follow.userId.toString() !== req.userId.toString());
//     user.followers = newFollowers;
//     return user.save();
//   })
//   .then(result =>{
//     res.status(200).json({message : "unfollowing user succesfully"});
//   })
//   .catch(err =>{
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   })
// }

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
        username : userInfo.username,
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
        username : followingInfo.username,
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





exports.getbookmarks = (req,res,next)=>{
  const userId = req.userId;
  User.findById(userId)
  .then(user =>{
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message : "succesfull feth !",
      bookmarks : user.bookmarks
    })
  })
  .catch(err =>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}


exports.likePost = (req,res,next)=>{
  const userId = req.userId;
  const postId = req.body.postId;
  var userinfo;
  var state;
  User.findById(userId)
  .then(user =>{
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    userinfo = user;
    return Post.findById(postId)
  })
  .then(post =>{
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
      return post.save();
    }else{
      post.likes.push({
        userId : userId,
        username : userinfo.username
      })
      state= true;
      return post.save();
    }
  })
  .then(result =>{
    if(state){
      res.status(200).json({message :"like added successfully"});
    }else{
      res.status(200).json({message :"like deleted successfully"});
    }
  })
  .catch(err =>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}


exports.commentPost = (req,res,next)=>{
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
  User.findById(userId)
  .then(user =>{
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    userInfo=user;
    return Post.findById(postId);
  })
  .then(post =>{
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    post.comments.push({
      content : content,
      time :formatDate(),
      imageUrl : commentImage,
      userId : userId,
      username : userInfo.username
    });
    post.save();
  })
  .then(result=>{
    res.status(200).json({message : "comment added successfully!"});
  })
  .catch(err =>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })

}


exports.likeComment = (req,res,next)=>{
  const userId = req.userId;
  const postId = req.body.postId;
  const commentId = req.body.commentId;
  var userInfo;
  User.findById(userId)
  .then(user=>{
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    userInfo = user;
    return Post.findById(postId);
  })
  .then(post =>{
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
      return post.save();
    }else{
      post.comments[lookedcommentIndex].likes.push({
        userId : userId,
        username : userInfo.username
      });
      return post.save();
    }
  })
  .then(result =>{
    res.status(200).json({message : "operation added successfully!"});
  })
  .catch(err =>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}


exports.saveTweet = async(req,res,next)=>{

  const userId = req.userId;
  const postId = req.body.postId;
  var data;
  try{
    const post = await Post.findById(postId);
    if(!post){
      const error = new Error('post not found!');
      error.statusCode = 404;
      throw error;
    }
    data = post;
    const checkuser = post.saves.find(user => user.toStirng() ===postId.toString());
    if(checkuser){
      const error = new Error('tweet saved before!');
      error.statusCode = 404;
      throw error;
    }
    post.saves.push(userId);
    const result1 = await post.save();
    const user = await User.findById(userId);
    if(!user){
      const error = new Error('user not found!');
      error.statusCode = 404;
      throw error;
    }
    const checkpostsaved = user.bookmarks.find(tweet => tweet._id.toString()=== postId);
    if(checkpostsaved){
      const error = new Error('tweet saved before!');
      error.statusCode = 404;
      throw error;
    }
    user.bookmarks.push(data);
    const result = await user.save();
    res.status(200).json({message:"tweet saved successfuly!"});
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
    post.retweets.push(req.userId);
    const res1 =await post.save();
    const user = await User.findById(req.userId);
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
    ///overhere
    for(let tweet of tweets){
      if(tweet.privacy === true){
      const postfollower = user.following.find(follower => follower.userId.toString() !== tweet.userId.toString());
      if(postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }

  }
  res.status(200).json({posts:posts});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}



exports.latestTweets = async (req,res,next)=>{
  console.log("kjjs")
  const timeNow = new Date();
  const userId = req.userId;
  var posts = [];
  try{
    const tweets = await Post.find();
    const user = await User.findById(userId);
    ///overhere
    for(let tweet of tweets){
      console.log(timeDif(new Date(tweet.timeCreated),timeNow))
      if((tweet.privacy === true) && (timeDif(new Date(tweet.timeCreated),timeNow)<1)){
      const postfollower = user.following.find(follower => follower.userId.toString() !== tweet.userId.toString());
      if(postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }

  }
  res.status(200).json({posts:posts});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}



exports.popularPeople = async(req,res,next)=>{
  const userId = req.userId;

  var users = await User.find();
  users.sort(function(a, b) {
    return b.followers.length - a.followers.length;
  });
  
  res.status(200).json({users:users});

};

exports.tweetMedia = async(req,res,next)=>{
  const userId = req.userId;
  var posts = [];
  try{
    const tweets = await Post.find();
    const user = await User.findById(userId);
    ///overhere
    for(let tweet of tweets){
      if(tweet.privacy === true && tweet.imageUrl != ""){
      const postfollower = user.following.find(follower => follower.userId.toString() !== tweet.userId.toString());
      if(postfollower){
        posts.push(tweet);
      }
      posts.sort(function(a, b) {
        return b.total - a.total;
      });
      
    

    }

  }
  res.status(200).json({posts:posts});
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}





