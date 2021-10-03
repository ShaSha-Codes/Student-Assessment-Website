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
      console.log(req.files.file)
      let sampleFile = req.files.file;
      sampleFile.mv('./test.mp4')
      // connect to the videos database
      const db = client.db('Saw');
  
      // Create GridFS bucket to upload a large file
      const bucket = new mongodb.GridFSBucket(db);
      const id = crypto.randomBytes(20).toString('hex');
      
      let u_data=await courseSchema.updateOne (
        {_id:req.params.course}, 
        { $push: { videos:{name:id} } },
    )
      // create upload stream using GridFS bucket
      const videoUploadStream = bucket.openUploadStream(id);
  
      // You can put your file instead of bigbuck.mp4
      const videoReadStream = fs.createReadStream("./test.mp4");
      console.log(videoReadStream);
      
      // Finally Upload!
      videoReadStream.pipe(videoUploadStream);
      console.log("LEZ GOOOOOOOOOOOOOOOOOOOO")
      // All done!
      res.status(200).send("Done...");
    });
  });

  router.get('/watch/:name',(req,res)=>{
    res.render('video',{name:req.params.name,req:req});
  })

  router.get("/mongo-video/:name", function (req, res) {
    mongodb.MongoClient.connect(dbs, function (error, client) {
      if (error) {
        res.status(500).json(error);
        return;
      }
      console.log("testing");
      // Check for range headers to find our start time
      const range = req.headers.range;
      if (!range) {
        res.status(400).send("Requires Range header");
      }
      console.log(range)
      const db = client.db('Saw');
      // GridFS Collection
      db.collection('fs.files').findOne({filename:req.params.name}, (err, video) => {
        if (!video) {
          res.status(404).send("No video uploaded!");
          return;
        }
        console.log(video)
        // Create response headers
        const videoSize = video.length;
        console.log(video.length)
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
        console.log(contentLength)
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