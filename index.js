const express = require('express');
const cors = require('cors');
require('dotenv').config()
const database = require('./services/database');

const router = express.Router();
const app = express()
const bodyParser = express.json();



database.createBlogPublishTable();


// routes

router.post('/publish',bodyParser, async (req,res)=> {
 const {blogContent,user,type,title,blogID} = req.body;
 console.log(req.body)
 try{
     let result = await database.insertBlog(blogID,user,title,blogContent,type);
     res.status(201).json({ "mess": "blog published" })

 }catch(e){
     if (e.code === 'ER_DUP_ENTRY'){
         let result = await database.insertBlog2(blogID,user, title, blogContent, type);
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




app.use('/blog', router);



app.listen(3001, () => { console.log('listening on port 3001') });
