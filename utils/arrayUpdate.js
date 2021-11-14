const tweet = require("../models/tweet");
const User = require("../models/user");

const arrayUpdate =  async(array)=>{
var newArray =[];
for(obj of array){
    var user = await User.findById(obj.userId);
    obj.username = user.username;
    obj.pp = user.photoProf ;
    newArray.push(obj);
}

return newArray;


};

module.exports = arrayUpdate;


