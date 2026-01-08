import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
console.log("--- DEBUG API CONFIG ---");
console.log("VITE_API_URL (env):", apiUrl);
console.log("Using Fallback?:", !apiUrl);

const api = axios.create({
    baseURL: apiUrl || 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;
