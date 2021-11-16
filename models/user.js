const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username : {
          type : String,
          required : true 
    },
    bio : {
        type : String,
        default :"Hi i'm new here,please fill me with a good presentation about you"
    },
    email : {
        type : String,
        required : true 
    },
    password : {
        type : String,
        required : true 
    },
    photoProf :{
        type:String
    },
    photoCover :{
        type:String
    },
    following : [{
        userId:{
            type: Schema.Types.ObjectId,
            required:true
          },
          timeFollowed : {
              type:String,
              required:true
          },
          username:{
            type : String,
            required:true
        },
        pp:{
            type:String
        },
        pc:{
            type :String
        },
        userBio :{
            type :String
        },
        userFolllowers : {
            type:Array
        },
        userFolllowing : {
            type:Array
        }
    }],
    followers : [
        {

        
        userId:{
            type: Schema.Types.ObjectId,
            required:true,
            
          },
          username:{
              type : String,
              required:true
          },
          pp:{
              type:String
          },
          timeFollowed : {
              type:String,
              required:true
          },
          pc:{
              type :String
          },
          userBio :{
              type :String
          },
          userFolllowers : {
              type:Array
          },
          userFolllowing : {
              type:Array
          }
        }
    ],
    bookmarks : {
        type : Array,
        required : true
    },
    retweet : {
        type : Array,
        required : true
    }
   
  });

module.exports = mongoose.model('User', userSchema);
