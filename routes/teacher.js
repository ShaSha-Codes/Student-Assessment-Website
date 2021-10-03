const express=require('express');
const router=express.Router();
const userSchema=require('../models/userSchema');
const courseSchema=require('../models/courseSchema');
const bcryptjs=require('bcryptjs');
const passport=require('passport');
const upload=require('../app.js');





const {ensureTeacherAuthenticated}=require('../config/auth');

router.get('/login', (req, res)=>
{
    const errors=[]
    res.render('login',{errors,req})
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
    
    const newCourse = new courseSchema({
        title: title,desc: desc,admin:admin
    })
    newCourse.save();
    console.log("Checking");
    console.log(newCourse);
    
   
    let u_data=await userSchema.updateOne (
        { email: req.user.email, }, 
        { $push: { course:{title:title,desc:desc,_id:newCourse._id} } },
    )
    userSchema.findOne({ email: req.user.email }, (err, user)=> {
        console.log(user)
    })
    res.redirect('/teacher/dashboard')
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/teacher/login')
})

router.get('/dashboard',ensureTeacherAuthenticated,(req,res)=>{
    res.render('teacherDashboard',{name:req.user.fname,courses:req.user.course,req:req});
})

router.get('/courses/:id',ensureTeacherAuthenticated,(req,res)=>{

    res.render('hello',{id:req.params.id,req:req})
})



router.get('/courses/:course/uploadVideo',(req,res)=>{
    res.render('uploadVideo',{course:req.params.course,req:req})
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/teacher/login')
})


router.get('/courses/:id/students',ensureTeacherAuthenticated,async(req,res)=>{
    students=await courseSchema.findOne({_id:req.params.id})
    console.log(req.params.id,students);
    res.render('studentlist',{id:req.params.id,list:students.student,req:req})
})
module.exports=router;

