const mongodb = require('mongodb');
const express=require('express');
const router=express.Router();
const dbs=require('../config/keys').URI;
const fs=require('fs');
const courseSchema=require('../models/courseSchema');
const userSchema=require('../models/userSchema');
const crypto = require("crypto");

router.post('/init-video/:course',function (req, res) {
 
    mongodb.MongoClient.connect(dbs, async(error, client)=>{
      if (error) {
        res.json(error);
        return;
      }
      try{
      let sampleFile = req.files.file;
      sampleFile.mv('./test.mp4')
      // connect to the videos database
      const db = client.db('Saw');
    
      // Create GridFS bucket to upload a large file
      const bucket = new mongodb.GridFSBucket(db);
      const id = crypto.randomBytes(20).toString('hex');
      if(req.body.title=="" || req.body.desc==""){
        throw "Empty Fields Error"
      }
      let u_data=await courseSchema.updateOne (
        {_id:req.params.course}, 
        { $push: { videos:{name:id, title:req.body.title,desc:req.body.desc} } }
    )
      // create upload stream using GridFS bucket
      const videoUploadStream = bucket.openUploadStream(id);
  
      // You can put your file instead of bigbuck.mp4
      const videoReadStream = fs.createReadStream("./test.mp4");
      
      // Finally Upload!
      videoReadStream.pipe(videoUploadStream);


      // All done!
      req.flash('success_msg','Video Uploaded!');
      res.redirect('/teacher/courses/'+req.params.course+'/uploadVideo')
      }catch(err){ 
        req.flash('error_msg','All Fields are Mandatory');
         res.redirect('/teacher/courses/'+req.params.course+'/uploadVideo')
      }
      
      
     
    });
  
  });

  router.get('/watch/:name',async(req,res)=>{
    ci=await courseSchema.findOne({"videos.name":req.params.name})
    let title,desc;
    for (let i = 0; i < ci.videos.length; i++) {
      if(ci.videos[i].name==req.params.name){
        title=ci.videos[i].title
        desc=ci.videos[i].desc
      }
    }
    
    res.render('video',{name:req.params.name,title:title,desc:desc,req:req});
  })



  router.get('/delete/:name',async(req,res)=>{
    ci=await courseSchema.findOne({"videos.name":req.params.name});
    courseVidDelete=await courseSchema.updateOne({"videos.name":req.params.name},{ $pull: {videos:{ name:req.params.name }}});
    mongodb.MongoClient.connect(dbs, function (error, client) {
    
    const db = client.db('Saw');
    db.collection('fs.files').findOne({filename:req.params.name}, (err, video) => {
      db.collection('fs.chunks').deleteMany({files_id:video._id},()=>{
        console.log("Deleted chunks")
      })
    })
   
    db.collection('fs.files').deleteMany( {filename:req.params.name },()=>{
      console.log('Deleted Files')
    } )
    
    req.flash('success_msg','Video Successfully Deleted');
    res.redirect('/teacher/courses/'+ci._id)
  })
  })



  router.get("/mongo-video/:name", function (req, res) {
    mongodb.MongoClient.connect(dbs, function (error, client) {
      if (error) {
        res.status(500).json(error);
        return;
      }
      // Check for range headers to find our start time
      const range = req.headers.range;
      if (!range) {
        res.status(400).send("Requires Range header");
      }
      
      const db = client.db('Saw');
      // GridFS Collection
      db.collection('fs.files').findOne({filename:req.params.name}, (err, video) => {
        if (!video) {
          res.status(404).send("No video uploaded!");
          return;
        }
        // Create response headers
        const videoSize = video.length;

        const chunkSize = 1 * 1e+6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, videoSize-1);
  
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        };
       
        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);
  
        // Get the bucket and download stream from GridFS
        const bucket = new mongodb.GridFSBucket(db);
        const downloadStream = bucket.openDownloadStreamByName(req.params.name, {
          start,end
        });
  
        // Finally pipe video to response
        downloadStream.pipe(res);
      });
    });
  });

  
module.exports=router;