const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cache = require("./utils/cache");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// -------------------------
// Middleware
// -------------------------

app.use(cors());

app.use(express.json());


// Logging middleware
app.use((req, res, next) => {
    console.log(
        `${req.method} ${req.url} - ${new Date().toISOString()}`
    );

    next();
});


// -------------------------
// MongoDB connection
// -------------------------

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });


// -------------------------
// Home route
// -------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running"
    });
});

app.get("/cache/stats", (req, res) => {
    const stats = cache.getStats();

    res.status(200).json({
        cacheHits: stats.hits,
        cacheMisses: stats.misses,
        allTasksCached: cache.has("all_tasks")
    });
});


// -------------------------
// Task routes
// -------------------------

const taskRoutes = require("./routes/taskRoutes");

app.use("/tasks", taskRoutes);


// -------------------------
// Global error handling
// -------------------------

app.use((err, req, res, next) => {

    console.error(err);

    if (err.name === "ValidationError") {

        const errors = {};

        for (const field in err.errors) {
            errors[field] = err.errors[field].message;
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
        });
    }

    if (err.name === "CastError") {

        return res.status(400).json({
            success: false,
            message: "Invalid task ID"
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


// -------------------------
// Start server
// -------------------------

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});