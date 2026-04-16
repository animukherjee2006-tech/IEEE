import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ieee-backend-fp0e.onrender.com/', 
  withCredentials: true, // Sabse important line yehi hai!
});

export default API;
