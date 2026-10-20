const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Task");
const cache = require("../utils/cache");
const editableFields = ["title", "description", "completed", "priority", "deadline"];

const isValidTaskId = (id) =>
    typeof id === "string" &&
    /^[a-f\d]{24}$/i.test(id) &&
    mongoose.Types.ObjectId.isValid(id);

const respondToTaskError = (res, err, action) => {
    console.error(`${action} error:`, err);

    if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({ message: "Invalid task data" });
    }

    return res.status(500).json({ message: `Failed to ${action} task` });
};

// GET all tasks
router.get("/", async (req, res) => {
    try {
        const cachedTasks = cache.get("all_tasks");

        if (cachedTasks !== undefined) {
            return res.status(200).json(cachedTasks);
        }

        const tasks = await Task.find();
        cache.set("all_tasks", tasks);

        return res.status(200).json(tasks);
    } catch (err) {
        console.error("GET /tasks error:", err);
        return res.status(500).json({ message: "Failed to fetch tasks" });
    }
});

// GET task by ID
router.get("/:id", async (req, res) => {
    if (!isValidTaskId(req.params.id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json(task);
    } catch (err) {
        return respondToTaskError(res, err, "fetch");
    }
});

// POST create task
router.post("/", async (req, res) => {
    try {
        const task = new Task(req.body);
        const savedTask = await task.save();

        cache.del("all_tasks");
        return res.status(201).json(savedTask);
    } catch (err) {
        return respondToTaskError(res, err, "create");
    }
});

// PUT update task
router.put("/:id", async (req, res) => {
    if (!isValidTaskId(req.params.id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const updates = Object.fromEntries(
            editableFields
                .filter((field) => Object.hasOwn(body, field))
                .map((field) => [field, body[field]])
        );
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        cache.del("all_tasks");
        return res.status(200).json(updatedTask);
    } catch (err) {
        return respondToTaskError(res, err, "update");
    }
});

// DELETE task
router.delete("/:id", async (req, res) => {
    if (!isValidTaskId(req.params.id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        cache.del("all_tasks");
        return res.status(200).json({
            message: "Task deleted successfully",
            task: deletedTask
        });
    } catch (err) {
        return respondToTaskError(res, err, "delete");
    }
});

module.exports = router;