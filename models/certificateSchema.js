const mongoose=require('mongoose');

const certificateSchema=new mongoose.Schema({
    cred:{
        type:String,
        required:true
    },
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    doc:{
        type:Date,
        
    },
    email:{
        type:String,
        required:true
    }
});

const Certificate =mongoose.model('Certificate',certificateSchema);
module.exports=Certificate;