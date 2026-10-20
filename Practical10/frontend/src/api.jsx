const BASE_URL = "http://localhost:5000";

const readResponse = async (response, fallbackMessage) => {
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || fallbackMessage);
    }

    return result;
};

export const getTasks = async () => {
    const response = await fetch(`${BASE_URL}/tasks`);
    return readResponse(response, "Failed to fetch tasks");
};

export const getTask = async (id) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`);
    return readResponse(response, "Failed to fetch task");
};

export const createTask = async (task) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });

    return readResponse(response, "Failed to create task");
};


export const updateTask = async (id, task) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });

    return readResponse(response, "Failed to update task");
};


export const deleteTask = async (id) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
    });

    return readResponse(response, "Failed to delete task");
};