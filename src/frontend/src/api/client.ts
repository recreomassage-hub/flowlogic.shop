import axios from 'axios';

// API URL для разных окружений
const getApiBaseUrl = () => {
  // 1. Приоритет - переменная из Vercel (которую мы добавили: VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Если мы в режиме разработки (npm run dev)
  if (import.meta.env.DEV) {
    return 'https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev';
  }
  
  // 3. Твой реальный рабочий Production API (актуальный endpoint после деплоя)
  return 'https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/prod';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Для httpOnly cookies
});

// Request interceptor для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок и refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Попытка обновить токен
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если refresh не удался, перенаправляем на логин
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


