const express = require('express');
const cors = require('cors');
require('dotenv').config()
const database = require('./services/database');


const router = express.Router();
const app = express()
const bodyParser = express.json();
const AWS = require('aws-sdk')



const s3 = new AWS.S3({
    endpoint: `s3-${process.env.S3_BUCKET_REGION}.amazonaws.com`,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET_NAME,
    signatureVersion: 'v4',
    region: process.env.S3_BUCKET_REGION
});


database.createBlogPublishTable();


// routes

router.post('/publish',bodyParser, async (req,res)=> {
 const {blogContent,user,type,title,blogID,coverImage} = req.body;
    const coverImageURL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${coverImage}`
 console.log(req.body)
 try{
     let result = await database.insertBlog(blogID, user, title, blogContent, type, coverImageURL );
     res.status(201).json({ "mess": "blog published" })

 }catch(e){
     if (e.code === 'ER_DUP_ENTRY'){
         let result = await database.insertBlog2(blogID, user, title, blogContent, type, coverImageURL);
         res.status(201).json({ "mess": "blog published" })
     }else{

     console.error(e);
     res.status(500).json({"err":"failed to publish your blog!"})
     }
 }
})


router.post('/change-blog-visibility',bodyParser, async (req,res)=>{
 const {type,blogID}  = req.body;
 try{
     let result = await database.updateBlogVisibility(type, blogID);
    res.status(200).json({ "mess": "blog visibility changed" })

  }catch(e){
    console.error(e);
    res.status(500).json({ "err": "failed to change blog visibility!" })

    }
})

router.put('/update-view-counter',bodyParser, async (req,res)=>{
    const { blogID} = req.body;
    try{
        let result = await database.updateBlogView(blogID);
        res.sendStatus(200);
    }catch(e){
        console.error(e);
    }
})

router.put('/update-like-counter',bodyParser,async (req,res)=>{

    const { blogID } = req.body;
    try {
        let result = await database.updateLikeCount(blogID);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
    }
})



router.get('/getAllBlogs', async (req,res)=>{
    const {blogList,user} = req.query;
    console.log(blogList)
    let result;
    try {
        if(blogList)
             result = await database.getBookmarkBlogs(blogList);
            else
            result = await database.getAllBlogs(user);
        console.log(result)
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(404).json({ "mess": "blog not found!" })
    }

})

router.get('/getUserBlogs', async (req, res) => {
    const { user } = req.query;
    console.log(user)
    try {
        let result = await database.getUserBlogs(user);
        console.log(result)
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(404).json({ "mess": "blog not found!" })
    }
})


router.get('/getBlog',async (req,res)=>{
     const {blogID} = req.query;
     console.log(blogID)
     try{
        let result = await database.getBlog(blogID);
        console.log(result)
        res.json(result);
     }catch(e){
         console.error(e);
         res.status(404).json({"mess":"blog not found!"})
     }
})

router.get('/getS3CoverImageSignedURL', async (req,res)=>{
    const {key} = req.query
        const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: "image/jpeg",
        Expires: 60 * 5
    };
    try {
        const url =  await s3.getSignedUrl("putObject", params);
        res.json({preSignedURL: url});
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json({err: 'error creating a presigned url for uploading cover image'})
        }
    }
    
})


if (process.env.NODE_ENV!=='production')
   app.use('/blog', router);
else
    app.use('/', router);




app.listen(process.env.LISTENING_PORT, () => { console.log(`listening on port ${process.env.LISTENING_PORT}`) });
