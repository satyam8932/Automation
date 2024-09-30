import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',  // Adjust according to your backend URL
});

// Interceptor to add the Authorization header with Bearer token for all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // Get token from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;  // Add token to the headers
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
