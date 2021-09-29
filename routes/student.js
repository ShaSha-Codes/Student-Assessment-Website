const express=require('express');
const router=express.Router();
const userSchema=require('../models/userSchema');
const courseSchema=require('../models/courseSchema');
const bcryptjs=require('bcryptjs');
const passport=require('passport');

const {ensureStudentAuthenticated}=require('../config/auth');

router.get('/reglog', (req, res)=>
{
    res.render('reglog')
})

router.get('/register',(req,res)=>{
    const errors=[];
    res.render('register',{errors})
})
router.get('/dashboard',ensureStudentAuthenticated,(req,res)=>{
    res.render('studentDashboard',{name:req.user.fname,courses:req.user.course});
})

router.get('/login',(req,res)=>{
    const errors=[]
    res.render('login',{errors})
})

router.post('/joinCourse',async(req,res)=>{
    try{
        let {cocode}=req.body;
    jc=await courseSchema.findOne({_id:cocode})
    checker=await userSchema.findOne({email:req.user.email,"course._id":cocode})
    console.log(checker);
    if(!checker){
        console.log(jc.title,jc.desc)
        let u_data=await userSchema.updateOne (
            { email: req.user.email, }, 
            { $push: { course:{title:jc.title,desc:jc.desc,_id:jc._id} } },
        )
        let uc_data=await courseSchema.updateOne (
            { _id:cocode }, 
            { $push: { student:{email:req.user.email,fname:req.user.fname,lname:req.user.lname} } },
        )
       
    }else{
        console.log("Already joined the course")
    }
    res.redirect('/student/dashboard')
    
    }catch(err){ 
        console.log("error")
        res.redirect('/student/dashboard')
    }
    
    
})

router.post('/register',(req,res)=>{
    let {fname,lname,dob,email,password,repassword}=req.body
    let errors=[]
    if(!fname || !email || !password || !repassword || !lname || !dob){
        errors.push({msg:'Please Fill all the fields'})
    }
    if(password.length<8)
    {
        errors.push({msg:'Password cannot be less than 8 characters'})
    }
    if(password!=repassword){
        errors.push({msg:'Passwords do not match'})
    }
    if(errors.length>0){
        res.render('register',{errors,fname,lname,email})
    }
    else{
        userSchema.findOne({email:email}).then((user)=>{
            if(user){
                errors.push({msg:'Email is already taken'})
                res.render('register',{errors,fname,lname,email})  
            }
            else{
                const newUser=new userSchema({
                    fname,lname,email,password,dob
                })
                console.log(newUser)
                bcryptjs.hash(newUser.password, 10, function(err, hash) {
                    newUser.password=hash
                    newUser.save()
                    .then(()=>{
                        req.flash('success_msg','Account Created! You can now Login');
                        res.redirect('/student/login');
                    }).
                    catch((err)=>console.log(err))
                });
            }
              
        }
        )}
    
        
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/student/dashboard',
        failureRedirect:'/student/login',
        failureFlash:true})
        (req,res,next);
});

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/student/login')
})
module.exports=router;