
import { useEffect, useState } from "react";
import "./Tasks.css";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../api";

function Tasks() {

    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // --------------------------------
    // GET TASKS
    // --------------------------------

    const loadTasks = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getTasks();

            setTasks(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadTasks();
    }, []);


    // --------------------------------
    // CREATE TASK
    // --------------------------------

    const handleCreate = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        setError("");
        setMessage("");

        const temporaryTask = {
            _id: "temp-" + Date.now(),
            title: title,
            description: description,
            completed: false,
        };

        setTasks((previousTasks) => [
            temporaryTask,
            ...previousTasks,
        ]);

        try {

            setSaving(true);

            const savedTask = await createTask({
                title: title,
                description: description,
                completed: false,
            });

            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task._id === temporaryTask._id
                        ? savedTask
                        : task
                )
            );

            setTitle("");
            setDescription("");

            setMessage("Task created successfully");

        } catch (err) {

            setTasks((previousTasks) =>
                previousTasks.filter(
                    (task) =>
                        task._id !== temporaryTask._id
                )
            );

            setError(err.message);

        } finally {

            setSaving(false);

        }
    };


    // --------------------------------
    // UPDATE TASK
    // --------------------------------

    const handleToggle = async (task) => {

        try {

            setError("");
            setMessage("");

            const updatedTask = await updateTask(
                task._id,
                {
                    title: task.title,
                    description: task.description,
                    completed: !task.completed,
                }
            );

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item._id === updatedTask._id
                        ? updatedTask
                        : item
                )
            );

            setMessage("Task updated successfully");

        } catch (err) {

            setError(err.message);

        }
    };


    // --------------------------------
    // DELETE TASK
    // --------------------------------

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setMessage("");

            await deleteTask(id);

            setTasks((previousTasks) =>
                previousTasks.filter(
                    (task) => task._id !== id
                )
            );

            setMessage("Task deleted successfully");

        } catch (err) {

            setError(err.message);

        }
    };


    return (

        <div className="container">

            <h1>Task Manager</h1>

            <p>
                React + Node.js + Express + MongoDB
            </p>


            {/* SUCCESS MESSAGE */}

            {message && (
                <div className="success">
                    {message}
                </div>
            )}


            {/* ERROR MESSAGE */}

            {error && (
                <div className="error">
                    {error}
                </div>
            )}


            {/* CREATE FORM */}

            <form
                onSubmit={handleCreate}
                className="form"
            >

                <input
                    type="text"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                    className="input"
                />


                <textarea
                    placeholder="Task description"
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    className="textarea"
                />


                <button
                    type="submit"
                    disabled={saving}
                    className="button"
                >
                    {saving
                        ? "Creating..."
                        : "Add Task"}
                </button>

            </form>


            <hr />


            <h2>Tasks</h2>


            {/* LOADING */}

            {loading && (
                <p>Loading tasks...</p>
            )}


            {/* EMPTY */}

            {!loading && tasks.length === 0 && (
                <p>No tasks found.</p>
            )}


            {/* TASK LIST */}

            {tasks.map((task) => (

                <div
                    key={task._id}
                    className="task"
                >

                    <h3
                        className={
                            task.completed
                                ? "completed"
                                : ""
                        }
                    >
                        {task.title}
                    </h3>


                    <p>
                        {task.description}
                    </p>


                    <p>
                        Status:{" "}
                        <strong>
                            {task.completed
                                ? "Completed"
                                : "Pending"}
                        </strong>
                    </p>


                    <button
                        onClick={() =>
                            handleToggle(task)
                        }
                        className="button"
                    >
                        {task.completed
                            ? "Mark Pending"
                            : "Mark Completed"}
                    </button>


                    <button
                        onClick={() =>
                            handleDelete(task._id)
                        }
                        className="deleteButton"
                    >
                        Delete
                    </button>

                </div>

            ))}

        </div>
    );
}


export default Tasks;
