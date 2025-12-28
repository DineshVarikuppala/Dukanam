import axios from 'axios';
// import { encryptData, decryptData } from './utils/encryption';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    // config.headers.Authorization = `Bearer ${user.token}`;
  }

  // ENCRYPTION DISABLED - Uncomment below to enable
  // if (config.data && config.method !== 'get') {
  //   const encryptedData = encryptData(config.data);
  //   config.data = { encrypted: encryptedData };
  //   config.headers['X-Encrypted'] = 'true';
  // }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use((response) => {
  // ENCRYPTION DISABLED - Uncomment below to enable
  // if (response.headers['x-encrypted'] === 'true' && response.data?.encrypted) {
  //   try {
  //     response.data = decryptData(response.data.encrypted);
  //   } catch (error) {
  //     console.error('Failed to decrypt response:', error);
  //   }
  // }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
