const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const readResponse = async (response, fallbackMessage) => {
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || fallbackMessage);
    }

    return result;
};

export const getTasks = async () => {
    const response = await fetch(`${BASE_URL}/api/tasks`);
    return readResponse(response, "Failed to fetch tasks");
};

export const getTask = async (id) => {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`);
    return readResponse(response, "Failed to fetch task");
};

export const createTask = async (task) => {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });

    return readResponse(response, "Failed to create task");
};

export const generateDescription = async (title) => {
    const response = await fetch(`${BASE_URL}/api/ai/generate-description`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });

    return readResponse(response, "Failed to generate a description");
};

export const updateTask = async (id, task) => {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });

    return readResponse(response, "Failed to update task");
};


export const deleteTask = async (id) => {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
    });

    return readResponse(response, "Failed to delete task");
};