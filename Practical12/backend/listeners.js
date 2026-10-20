
const taskEvents = require("./events");


taskEvents.on("task-created", async (task) => {
    console.log("\n[Notification] Processing started");
    console.log(`[Notification] Task: ${task.title}`);
    console.log(`[Notification] Started at: ${new Date().toISOString()}`);

    // Artificial delay of 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`[Notification] Completed at: ${new Date().toISOString()}`);
    console.log("[Notification] Notification processed successfully\n");
});


taskEvents.on("notification-error", (error, task) => {
    console.error(
        `[Notification Error] Task "${task.title}":`,
        error.message
    );
});

taskEvents.on("task-deleted", (task) => {
    console.log("\n[Task Deleted]");
    console.log(`[Task Deleted] Title: ${task.title}`);
    console.log(`[Task Deleted] Time: ${new Date().toISOString()}`);
});
