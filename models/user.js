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
        defult :"hi i'm new here"
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
          username:{
              type : String,
              required :true
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
              required :true
          }
        }
    ]
   
  });

module.exports = mongoose.model('User', userSchema);
