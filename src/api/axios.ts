import axios from 'axios';
import { api } from './config';

const axiosInstance = axios.create({
    baseURL: api.baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 404) {
            throw new Error('Resource not found');
        }
        if (error.response?.status === 500) {
            throw new Error('Server error');
        }
        throw error;
    }
);

export default axiosInstance; 