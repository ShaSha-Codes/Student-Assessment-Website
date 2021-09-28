const express=require('express');
const router=express.Router();
const userSchema=require('../models/userSchema');
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

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/teacher/login')
})

router.get('/dashboard',ensureTeacherAuthenticated,(req,res)=>{
    res.render('test',{name:req.user.fname});
})
module.exports=router;

