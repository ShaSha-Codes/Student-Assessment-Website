const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    admin:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    },
    description:{
        type:String,
        required:true
    },
    videos:{
        type:[string]
    },
    student:{
        type:[string]
    }
});

const User =mongoose.model('User',userSchema);
module.exports=User;