//Modules
const express=require('express');
const mongoose=require('mongoose');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const fileUpload = require('express-fileupload');
const fs=require('fs');

//new
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const {GridFsStorage}=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const methodOverride=require('method-override');

const fileSchema=new mongoose.Schema({md5:String})


//Routers
const videoRouter=require('./routes/video')
const teacherRouter=require('./routes/teacher')
const quizRouter=require('./routes/quiz')
const studentRouter=require('./routes/student')
const certificateRouter=require('./routes/certificate')

//URI
const dbs=require('./config/keys').URI;
const { GridFsStorageCtr } = require('multer-gridfs-storage/lib/gridfs');

//Connecting to Atlas DB
mongoose.connect(dbs,{ useNewUrlParser:true,useUnifiedTopology: true  })
.then((conn)=>{
    console.log("Connected to MongoDB")
}).catch((err)=>console.log(err))




const app = express();
require('./config/passport')(passport);
app.use(express.json());

app.set('view engine','ejs');

//Body Parser
app.use(express.urlencoded({extended:false}));
app.use(fileUpload());
//Express session
app.use(session({
    secret: 'test',
    resave: true,
    saveUninitialized: true,
  }))
  
//Password middleware
app.use(passport.initialize());
app.use(passport.session());



//Connect Flash
app.use(flash());

//Global Vars
app.use((req,res,next)=>{
 res.locals.success_msg=req.flash('success_msg');
 res.locals.error_msg=req.flash('error_msg');
 res.locals.error=req.flash('error');
 next();
})
  

app.use('/quiz',quizRouter)
app.use('/video',videoRouter)
app.use('/teacher',teacherRouter)
app.use('/student',studentRouter)
app.use('/certificate',certificateRouter)
app.get('/',(req,res)=>{
    res.render('index',{req:req})
})
app.listen(3000,()=>{
    console.log("Server Running on Port 3000")
})
