import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ieee-1ewt.onrender.com', 
  withCredentials: true, // Sabse important line yehi hai!
});

export default API;
