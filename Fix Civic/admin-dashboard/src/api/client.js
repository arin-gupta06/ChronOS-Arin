import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

// Add auth token to requests
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('civicfix_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('civicfix_token');
            localStorage.removeItem('civicfix_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Auth API ---
export const loginAdmin = async (email, password) => {
    const { data } = await client.post('/api/v1/auth/login', { email, password });
    return data;
};

// --- Reports API ---
export const getReports = async (params = {}) => {
    const { data } = await client.get('/api/v1/reports', { params });
    return data;
};

export const getReport = async (id) => {
    const { data } = await client.get(`/api/v1/reports/${id}`);
    return data;
};

export const updateReport = async (id, updates) => {
    const { data } = await client.put(`/api/v1/reports/${id}`, updates);
    return data;
};

export const postToX = async (id) => {
    const { data } = await client.post(`/api/v1/reports/${id}/post-to-x`);
    return data;
};

// --- Health ---
export const checkHealth = async () => {
    const { data } = await client.get('/api/v1/health');
    return data;
};

// --- Settings API ---
export const getSettings = async () => {
    const { data } = await client.get('/api/v1/settings');
    return data;
};

export const updateSettings = async (updates) => {
    const { data } = await client.put('/api/v1/settings', updates);
    return data;
};

export default client;
