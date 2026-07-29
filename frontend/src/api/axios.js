import axios from "axios";

// Create a reusable Axios instance for all API requests
const api = axios.create({
  // Base URL for the backend API
  baseURL: "http://localhost:8000/api/v1",

  // Allow sending cookies and authentication data with requests
  withCredentials: true,

  // Default headers for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
