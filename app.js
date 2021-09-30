//Modules
const express=require('express');
const mongoose=require('mongoose');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const fs=require('fs');
//new
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const {GridFsStorage}=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const methodOverride=require('method-override');


//Routers
const teacherRouter=require('./routes/teacher')
const studentRouter=require('./routes/student')
const certificateRouter=require('./routes/certificate')

//URI
const db=require('./config/keys').URI;
const { GridFsStorageCtr } = require('multer-gridfs-storage/lib/gridfs');


//new
let gfs;
let gridFSBucket;
//Connecting to Atlas DB
mongoose.connect(db,{ useNewUrlParser:true,useUnifiedTopology: true  })
.then((conn)=>{
  // gridFSBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
  //   bucketName: 'uploads'
  // });
    gfs=Grid(conn.connection.db,mongoose.mongo);
    gfs.collection('uploads')
    
    console.log("Connected to MongoDB")
}).catch((err)=>console.log(err))

//Create storage engine
const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });



const app = express();
require('./config/passport')(passport);
app.use(express.json());

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
  
app.post('/videoUpload',upload.single('file'),(req,res)=>{
    // res.json({file:req.file});
    res.redirect('/');
})
//single file
app.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file|| file.length===0){
            return res.status(404).json({error:"No file exists"});
        }
        return res.json(file);
    })
})

//single image
// app.get('/image/:filename',(req,res)=>{
//     gfs.files.findOne({filename:req.params.filename},(err,file)=>{
//         if(!file|| file.length===0){
//             return res.status(404).json({error:"No such image exists"});
//         }
//         //Check if image
//         if(file.contentType=='image/jpeg' || file.contentType==='image/png'||file.contentType==='video/mp4'){
//             //Read output to browser
//             var readstream = gfs.createReadStream(file.filename);
//             readstream.pipe(res);
//         }else{
//             res.status(404).json({error:"Not an image"});
//         }
//     })
// })
app.get('/video/:id',(req,res)=>{
    res.render('video',{data:req.params.id})
})
//video
app.get('/video/vid/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        
            const range = req.headers.range;
            const videoSize = file.length;
        
            const chunkSize = 1 * 1e+6;
            const start = range != undefined ? Number(range.replace(/\D/g, "")) : 0;
            const end = Math.min(start + chunkSize, videoSize-1 );
        
            const contentLength = end - start + 1;
            console.log("Hello World")
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4"
            }
            res.writeHead(206, headers);
        
            // const readStream = gridFSBucket.openDownloadStream(file.filename,{start,end});
            var readstream = gfs.createReadStream(file.filename,{start,end});
            readstream.pipe(res);
            
       
    })
})


app.use('/teacher',teacherRouter)
app.use('/student',studentRouter)
app.use('/certificate',certificateRouter)
app.get('/',(req,res)=>{
    res.render('index')
})
app.listen(3000,()=>{
    console.log("Server Running on Port 3000")
})
