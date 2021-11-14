
const User = require("../models/user");

const arrayUpdate = require("./arrayUpdate");


const  tweetUpdate = async(tweets)=>{
    var newTweets = [];
    for(tweet of tweets){
        if(tweet.tweet){
        
        var user = await User.findById(tweet.tweet.userId);
        tweet.tweet.username = user.username;
        tweet.tweet.pp = user.photoProf ;
        tweet.tweet.likes = await arrayUpdate(tweet.tweet.likes);
        for(comment of tweet.tweet.comments){
            comment.likes = await arrayUpdate(tweet.tweet.likes);
        }
        tweet.tweet.comments = await arrayUpdate(tweet.tweet.comments);
        tweet.tweet.retweets = await arrayUpdate(tweet.tweet.retweets);

        newTweets.push(tweet);
    }else{
        var user = await User.findById(tweet.userId);
        tweet.username = user.username;
        tweet.pp = user.photoProf ;

        tweet.likes = await arrayUpdate(tweet.likes);
        for(comment of tweet.comments){
            comment.likes = await arrayUpdate(tweet.likes);
        }
        tweet.comments = await arrayUpdate(tweet.comments);
        tweet.retweets = await arrayUpdate(tweet.retweets);

        newTweets.push(tweet); 
    }
    }


    return newTweets;
};

module.exports = tweetUpdate;