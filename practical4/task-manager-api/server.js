const express = require("express");

const app = express();

const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

let tasks = [
    {
        id: 1,
        title: "Learn Node.js",
        completed: false
    },
    {
        id: 2,
        title: "Practice Express",
        completed: false
    }
];

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

app.get('/tasks',(req,res)=>{
    res.status(200).json(tasks);
})

//create task

app.post('/tasks',(req,res)=>{
    const {title, completed}=req.body;
    const newTask={
        id:tasks.length+1,
        title:title,
        completed:completed || false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);

})

//get single task

app.get("/tasks/:id",(req,res)=>{
    const id= parseInt(req.params.id);

    const task=tasks.find(task=> task.id===id);
    if(!task){
        return res.status(404).json({
            error:"Task not found"
        })
    }
    res.status(200).json(task);
})

//update task

app.put('/tasks/:id',(req,res)=>{
    const id=parseInt(req.params.id);

    const task=tasks.find(task=>task.id===id);
      if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }
    if(req.body.title !== undefined){
        task.title=req.body.title;
    }
    if(req.body.completed !== undefined){
        task.completed=req.body.completed;
    }
    res.status(200).json(task);


})

//delete task
app.delete('/tasks/:id',(req,res)=>{
    const id=parseInt(req.params.id);

      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }
    
    const deletedTask = tasks.splice(taskIndex,1);
    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });


})

//add content type validation
app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        const contentType = req.headers["content-type"];

        if (!contentType || !contentType.startsWith("application/json")) {
            return res.status(400).json({
                error: "Content-Type must be application/json"
            });
        }
    }

    next();
});
//add route-specific ID validation

// const validateTaskId = (req, res, next) => {
//     const id = Number(req.params.id);

//     if (!Number.isInteger(id) || id <= 0) {
//         return res.status(400).json({
//             error: "Invalid task ID"
//         });
//     }

//     next();
// };

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl
    });
});

//error handler

// app.use((err, req, res, next) => {
//     console.error(err.stack);

//     res.status(500).json({
//         error: "Something went wrong"
//     });
// });

//add test error route

app.get("/error", (req, res, next) => {
    const error = new Error("Test error");

    next(error);
});