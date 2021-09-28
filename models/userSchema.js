const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"student"
    },
    course:[{title:String,desc:String}]
        
    
});

const User =mongoose.model('User',userSchema);
module.exports=User;