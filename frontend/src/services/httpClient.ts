import axios from 'axios';
import Cookies from 'js-cookie';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || '/api/v1';

const httpClientWithoutVersion = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const httpClient = axios.create({
  baseURL: `${apiBaseUrl}${apiVersion}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

httpClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error?.response?.status === 401) {
    Cookies.remove('token');
  }

  return Promise.reject(error);
});

export { httpClientWithoutVersion };
export default httpClient;
