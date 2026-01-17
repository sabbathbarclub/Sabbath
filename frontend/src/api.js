import axios from 'axios';

// __API_URL__ is defined in vite.config.js at build time
// We use try/catch to prevent ReferenceError if the build config fails to inject it
let apiUrl;
try {
    apiUrl = __API_URL__;
} catch (error) {
    // Fallback to standard env var or hardcoded production string
    console.warn('__API_URL__ not defined, using fallback.');
    apiUrl = import.meta.env.VITE_API_URL || 'https://sabbath-rhxv.onrender.com/api/';
}

const api = axios.create({
    baseURL: apiUrl,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;
