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
            type:String
        },
        pp:{
            type:String
        },
        likes : [{
            userId :{
                type : Schema.Types.ObjectId,
                required : true,
                ref : "User"
            },
            username :{
                type:String
            },
            pp:{
                type:String
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
                type:String
            },
            pp:{
                type:String
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
        type:String
    },
    pp :{
        type:String
    },
    privacy : {
        type : Boolean,
        required  : true,
        
    },
    total:{
         type : Number,
    },
    rank : {
         type: Number
    }
 
    
    

});

module.exports = mongoose.model('Tweet', tweetSchema);
