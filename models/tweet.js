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
    retweet : [{
        userId:{
            type: Schema.Types.ObjectId,
            required :true,
            ref : 'User'
        },
        username:{
            type : String,
            required :true
        }
    }],
    comments :[{
        content :{
            type : String,
            required : true
        },
        time :{ 
            type: Date,
             default: Date.now 
        },
        imageUrl:{
            type : String
        },
        userId:{
            type : Schema.Types.ObjectId,
            required : true,
            ref : "User"
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

    userId :{
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    }
    
    

},{ timestamps: true });

module.exports = mongoose.model('Tweet', tweetSchema);
