import axios from 'axios';
import Cookies from 'js-cookie';

const httpClientWithoutVersion = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + process.env.NEXT_PUBLIC_API_VERSION || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token to every request
httpClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors globally
httpClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error?.response.status === 401) {
    Cookies.remove('token')
    // Router.push("/users/sign-in")
  }else if (error?.response.status === 404) {
    // console.log('error', error)
    // Router.push("/404")
  }
  return Promise.reject(error);
});

export { httpClientWithoutVersion };
export default httpClient;
