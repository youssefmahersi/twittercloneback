const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
    userId :{
        type: Schema.Types.ObjectId,
            required :true,
            ref : 'User'
    },
    tweets : [
        {
       type :Object,
       required :true 
        }
    ]
})