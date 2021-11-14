const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tweretSchema = new Schema({
    
   type : {
       type : String,
       required : true
   },
   creatorId : {
        type: Schema.Types.ObjectId,
        required:true,
        ref :"User"
   },
   creatorUsername : {
        type : String
   },
   postId :{
        type: Schema.Types.ObjectId,
        required:true,
        ref :"Tweet"
   },
   time :{
        type:String,
        required:true
   },
   privacy:{
       type: Boolean
   },
   retweeterId:{
        type: Schema.Types.ObjectId,
        ref :"User"
   },
   retweeterUsername:{
        type : String
   }
});

module.exports = mongoose.model('Tweret', tweretSchema);
