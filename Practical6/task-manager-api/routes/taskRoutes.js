const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

// GET all tasks
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// GET task by ID
router.get("/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (err) {
        res.status(400).json({
            message: "Invalid task ID"
        });
    }
});

// POST create task
router.post("/", async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            completed: req.body.completed || false
        });

        const savedTask = await task.save();

        res.status(201).json(savedTask);

    } catch (err) {
        res.status(400).json({
            message: "Failed to create task"
        });
    }
});

// PUT update task
router.put("/:id", async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(updatedTask);

    } catch (err) {
        res.status(400).json({
            message: "Failed to update task"
        });
    }
});

// DELETE task
router.delete("/:id", async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(
            req.params.id
        );

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully",
            task: deletedTask
        });

    } catch (err) {
        res.status(400).json({
            message: "Failed to delete task"
        });
    }
});

module.exports = router;