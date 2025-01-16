import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Debug log
  console.log('Request config:', config);
  
  return config;
}, (error) => {
  console.error('Axios interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response);
    return Promise.reject(error);
  }
);

export default axiosInstance; 