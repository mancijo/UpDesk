import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.15.8:5291',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@UpDesk:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Implementar lógica de refresh token ou logout
      localStorage.removeItem('@UpDesk:token');
    }
    return Promise.reject(error);
  }
);

export default api;