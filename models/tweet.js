const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tweetSchema = new Schema({
    comment :{
        type:String,
        required :true
    },
    imageUrl :{
        type:String
    },
    timeCreated:{
        type:String
    },
    comments :[{
        content :{
            type : String,
            required : true
        },
        time :{ 
            type: String,
            required:true
        },
        imageUrl:{
            type : String
        },
        userId:{
            type : Schema.Types.ObjectId,
            required : true,
            ref : "User"
        },
        username:{
            type:String,
            required :true
        },
        pp:{
            type:String,
            required:true
        },
        likes : [{
            userId :{
                type : Schema.Types.ObjectId,
                required : true,
                ref : "User"
            },
            username :{
                type:String,
                required:true
            }
        }]
    }
    ],
    likes :[
        {
            userId :{
                type : Schema.Types.ObjectId,
                required : true,
                ref : "User"
            },
            username :{
                type:String,
                required:true
            }
        }
    ],
    saves :{
        type :Array,
    },
    retweets:{
        type :Array,
    },
    userId :{
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    username :{
        type:String,
        required:true
    },
    privacy : {
        type : Boolean,
        required  : true,
        
    },
    total:{
         type : mongoose.Decimal128,
    },
    rank : {
         type: mongoose.Decimal128
    }
 
    
    

});

module.exports = mongoose.model('Tweet', tweetSchema);
