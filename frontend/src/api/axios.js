import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true, // Sabse important line yehi hai!
});

export default API;