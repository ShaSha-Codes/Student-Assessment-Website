const mongoose=require('mongoose');

const courseSchema=new mongoose.Schema({
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
        default:Date.now
    },
    desc:{
        type:String,
        required:true
    },
    videos:{
        type:[String]
    },
    student:{
        type:[String]
    }
});

const Course =mongoose.model('Course',courseSchema);
module.exports=Course;