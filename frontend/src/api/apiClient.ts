const API_BASE_URL = "http://localhost:8000/api";

export const getAuthHeader = () => {
    const user = localStorage.getItem("user");
    if (!user) return {};
    const { username, dni } = JSON.parse(user);
    return {
        'Authorization': `Basic ${btoa(`${username}:${dni}`)}`,
    };
};

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
        ...options.headers,
        ...getAuthHeader(),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
};

export default apiClient;
