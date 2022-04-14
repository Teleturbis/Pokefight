import axios from 'axios';

// TODO dev-prod-Umgebungsvariable
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_EXPRESS_HOST,
  // baseURL: 'https://express-db-pokefight.herokuapp.com',
  headers: {
    'Content-type': 'application/json',
  },
});

export default apiClient;
