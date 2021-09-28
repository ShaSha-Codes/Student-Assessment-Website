const express=require('express');
const router=express.Router();
const userSchema=require('../models/userSchema');
const courseSchema=require('../models/courseSchema');
const bcryptjs=require('bcryptjs');
const passport=require('passport');

const {ensureTeacherAuthenticated}=require('../config/auth');

router.get('/login', (req, res)=>
{
    const errors=[]
    res.render('login',{errors})
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/teacher/dashboard',
        failureRedirect:'/teacher/login',
        failureFlash:true})
        (req,res,next);
});

router.post('/createCourse',async(req,res)=>{
    let {title,desc}=req.body;
    let admin=req.user.email;
    console.log(req.user)
    const newCourse = new courseSchema({
        title: title,desc: desc,admin:admin
    })
    newCourse.save();
    console.log(req.body)
   
    let u_data=await userSchema.updateOne (
        { email: req.user.email, }, 
        { $push: { course:{title:title,desc:desc} } },
    )
    userSchema.findOne({ email: req.user.email }, (err, user)=> {
        console.log(user)
    })
    
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/teacher/login')
})

router.get('/dashboard',ensureTeacherAuthenticated,(req,res)=>{
    res.render('test',{name:req.user.fname});
})
module.exports=router;

