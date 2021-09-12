const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Tweet  = require("../models/tweet");
const timeDif = require("../utils/timeDif");

function timeFun (t){
    const kaser = -(t/8);
    const exp = Math.exp(kaser);
    return 1 -exp+Math.log10(1.02);
}

router.get("/update",async (req,res,next)=>{
  try{
    const posts = await Tweet.find();
    const users = await User.find();
    for(let post of posts){
        var likes = post.likes.length;
        var comments = post.comments.length;
        var saves = post.saves.length;
        var retweets = post.retweets.length;
        const user = await User.findById(post.userId);
        var popularity = (user.followers.length *100)/users.length;
        const total = (likes*popularity)+(saves*popularity)+popularity+comments+retweets;
        var time = timeDif(new Date(post.timeCreated),new Date());
        console.log(time)
        const r = total / timeFun(time);
        post.total = total;
        post.rank = r;
        const result = await post.save();
        console.log("updated");
    }
    
 }catch(err){ 
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
 }  
})



module.exports = router;