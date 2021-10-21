const express =require('express');
const questions = require('../models/questions');
const answers=require('../models/answers');
const courseSchema=require('../models/courseSchema');
const certificate = require('../models/certificateSchema');
const router=express.Router();
 
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

router.get('/test/:id',async(req,res)=>{
    const id= req.params.id;
    data=await answers.findOne({'email':req.user.email,'quiz':req.params.id})
   
    data1=await questions.findById(id)
  
    if(data!=null){
        res.render('pass',{que:[data1],bod:data}) 
        
 
    }else{
        res.render('quiz1',{question:data1,id:id})
        // questions.findById(id).then(result =>{res.render('quiz1',{question:data1,id:id}) 
        //     })
        // .catch(err=>{console.log(err);
        // });
    }
   
    
})


// router.get('/record/:id',(req, res)=>{
//     answers.find()

//     answers.find()
//     .then((result)=>{
//         res.render('record',{answers:result})})
//         .catch((err)=>{console.log(err)})  
// })


router.get('/:id',(req,res)=>{
    res.render('template2',{id:req.params.id})
});


router.post('/create/:id',async(req,res)=>{
    const question = new questions(req.body);
    console.log(req.body)
    question.course=req.params.id
    console.log(question)
    question.save()
    let u_data=await courseSchema.updateOne (
                    { _id: req.params.id },
                    { $push: {quiz:{tid:question._id,subject:question.subject} } }
                   
                )

    let uc_data=await questions.updateOne (
            { _id: question._id }, 
            { course: req.params.id }
            
        )
    const re='/teacher/courses/'+req.params.id;
    res.redirect(re);

 })


// router.get('/quiz/:id',(req,res)=>{
//     const id= req.params.id;
//     questions.findById(id)
//     .then(result =>{res.render('quiz1',{question:result});
// })
// .catch(err=>{console.log(err);
//  });
// })




router.get('/list/:id',async(req,res)=>{
    const ans=await answers.find({'quiz':req.params.id});
    let count=0;
    for(let key in ans[0]){
        console.log(key)
        if(key.includes("ans")){
            if(ans[0][key]!=null){
                ++count;
            }
           
        }
    }
    console.log(count)
    res.render('marksheet',{ans,count});
})

router.post('/record/:id',async(req,res)=>{
   const que = await questions.find({_id:req.params.id});
   console.log(que);
    const bod=req.body;
    bod.score=0;

    for(let i=0;i<que[0].corans.length;i++){ 
        const tp= "ans"+(i+1);

        if(bod[tp]==que[0].corans[i]){
          bod.score+=1;   
        }
    }
    bod.quiz=req.params.id;

    const answer=new answers(bod);
    
    let count=0
        for(let key in bod){
            if(key.includes("ans")){
                ++count;
            }
        }
        const pass=(count/100)*30;
        if(bod.score<pass){
            res.render("fail")
        }else{
            console.log(que)
            // if(que[0].lass=='yes'){
             
            //     c=courseSchema.find({'_id':que[0].course})
            //     var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            //     cert={'cred':makeid(8),'fname':req.user.fname,'lname':req.user.lname,'doc':utc,'email':req.user.email,'title':c.title}
            //     let certif=new certificate(cert)
            //     certif.save()
            //     console.log(certif)
            // }
            answer.save()
            res.render('pass',{bod,que})
        }
    
  
})



module.exports=router;