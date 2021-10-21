const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const questionSchema = new Schema({

       subject:{
           type:String,
           required:true,
       },
       no:{type:Array, required:true
        },
       Question:{
       type:Array,
       required:true
        },
        option1:{
            type:Array,
            required:true
        },
        option2:{
            type:Array,
            required:true
        },
        option3:{
            type:Array,
            required:true
        },
        option4:{
            type:Array,
            required:true
        },
        corans:{
            type:Array,required:true
        },
        course:{type:String},
        desc:{type:String},
        time:{type:String},
        lass:{type:String}
    
    
})

    const question =mongoose.model('question',questionSchema);
    module.exports = question;