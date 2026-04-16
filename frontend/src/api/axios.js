import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-ieeee.onrender.com', 
  withCredentials: true, // Sabse important line yehi hai!
});

export default API;
