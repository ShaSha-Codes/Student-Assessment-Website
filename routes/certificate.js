const express=require('express');
const router=express.Router();
const certificateSchema=require('../models/certificateSchema');



router.get('/verify',(req,res)=>{
    const errors=[]
    res.render('certify',{errors,req:req})
})


router.post('/search',async(req,res)=>{
    let errors=[]
    try{
        let {credcode}=req.body;
        
    cert=await certificateSchema.findOne({cred:credcode})
    console.log(cert)
    if(cert){
        res.render('verify',{fname:cert.fname, lname:cert.lname,title:cert.title,date:cert.doc,email:cert.email,cred:cert.cred,req:req}); 
    }
    else{
        console.log("Certificate Not Valid")
        errors.push({msg:'Certificate Not Valid'})
        res.render('certify',{errors,req:req})
    }
    
    
    }catch(err){ 
        console.log("error")
        errors.push({msg:'Some Error'})
        
    }
    
    
})
module.exports=router;