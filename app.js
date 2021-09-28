//Modules
const express=require('express');
const mongoose=require('mongoose');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');


//Routers
const teacherRouter=require('./routes/teacher')
const studentRouter=require('./routes/student')

//URI
const db=require('./config/keys').URI

//Connecting to Atlas DB
mongoose.connect(db,{ useNewUrlParser:true })
.then(()=>console.log("Connected to MongoDB"))
.catch((err)=>console.log(err))

const app = express();
require('./config/passport')(passport);


app.set('view engine','ejs');

//Body Parser
app.use(express.urlencoded({extended:false}));

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

app.use('/teacher',teacherRouter)
app.use('/student',studentRouter)
app.get('/',(req,res)=>{
    res.render('index')
})
app.listen(3000,()=>{
    console.log("Server Running on Port 3000")
})
