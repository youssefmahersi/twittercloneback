const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const actSchema = new Schema({

    userId:{
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    activities:{
        type:Array,
        required:true
    }


});


module.exports = mongoose.model('Act',actSchema);