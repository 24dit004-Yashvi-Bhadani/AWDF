const express = require("express");

const app = express();

const PORT = 5000;
const mongoose=require('mongoose');

require('dotenv').config();
mongoose.connect(process.env.MONGO_URL).then(
    ()=>console.log('mongoDB connected'))
    .catch((err)=>{
    console.log(err);
    
});



// Middleware to parse JSON request bodies
app.use(express.json());

const Task=require('./models/Task');


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use((req, res, next) => {
    console.log(
        `${req.method} ${req.url} - ${new Date().toISOString()}`
    );

    next();
});
//get all task


app.get('/',(req,res,next)=>{
    res.json({
        message:'Task Manager API is running'
    })
})

app.get('/tasks',async (req,res,next)=>{
    try{
        const tasks= await Task.find();
        res.json(tasks);
    }catch(err){
        next(err);
    }

})

app.get('/tasks/:id',async (res,req,next)=>{
    try{
        const task= await Task.findById(req.params.id);
        if(!task){
            return res.status(404).json({
                success:false,
                message:'Task not found'
            })
        }
        res.json(task);

    }catch(err){
        next(err)
    }
})

//create task
app.post('/tasks',async (req,res,next)=>{
    try{
        const task=await Task.create(req.body);
        res.status(201).json(task);
    }
    catch(err){
        next(err);
    }
})


//update task
app.put('/tasks/:id',async (req,res,next)=>{
 try{
    const task=await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new:true,
            runVAlidators:true
        }
    );
    res.json(task);
 }catch(err){
    next(err)
 }

})

//delete task
app.delete('/tasks/:id',async (req,res,next)=>{
    try{
        const task=await Task.findByIdAndDelete(req.params.id);
        res.json(task);
    }catch(err){
        next(err)
    }
})
//globle error handling
app.use((err,req,res,next)=>{
    console.error(err);
    if(err.name === 'ValidationError'){
        const errors={};
        for(const field in err.errors){
            errors[field]=err.errors[field].message;

        }
        return res.status(400).json({
            success:false,
            message:'Validation failed',
            errors:errors
        })
    }
    if(err.name==='CastError'){
        return res.status(400).json({
            success:false,
            message: 'Invalid task ID'
        })
    }
    res.status(500).json({
        success:false,
        message:'Internal server error'
    })
})
