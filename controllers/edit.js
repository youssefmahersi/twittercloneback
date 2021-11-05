const { validationResult } = require('express-validator');
const Post = require("../models/tweet");
const User = require("../models/user");
const Tweret = require("../models/tweret");
const bcrypt = require("bcryptjs");
const {deleteFile} = require("../file");
const path = require("path");
exports.photoProfil = async(req,res,next)=>{

    try{
        const user = await User.findById(req.userId);
        if(user.photoProf){
            deleteFile(user.photoProf.slice(7)); 
        }

        user.photoProf = req.file.path;
        const result = await user.save();
    
        res.status(200).json({
            message: "profil picture updated succesfully!"
        })
    }
    catch(err){
        if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }

}


exports.photoCoverture = async(req,res,next)=>{

    try{

        const user = await User.findById(req.userId);
        if(user.photocover){
            deleteFile(user.photoCover.slice(7)); 
        }
        user.photoCover = req.file.path;
        const result = await user.save();
        
        res.status(200).json({
            message: "banner updated succesfully!"
        })
    }
    catch(err){
        if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }

}

exports.editUser = async(req,res,next)=>{
    
    
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const username = req.body.username;
    const password = req.body.password;
    const bio = req.body.bio;
    const user = await User.findById(req.userId);
    user.username = username;
    user.bio = bio;
    const equalPassword = await bcrypt.compare(password, user.password);
    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword;
     const result = await user.save();
    res.status(200).json({
        message : "Update done successfully!"
    });
}catch(err){
    if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}


}