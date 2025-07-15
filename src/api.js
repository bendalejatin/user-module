import axios from 'axios';

//const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://backend-clr8.onrender.com" ; // deployment url

const api = axios.create({
  baseURL: `${BASE_URL}/api/users`,
});

export const loginUser = (data) => api.post('/login', data);
