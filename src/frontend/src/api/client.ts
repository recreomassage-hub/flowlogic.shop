import axios from 'axios';

// API URL для разных окружений
const getApiBaseUrl = () => {
  // 1. Приоритет - переменная из Vercel (которую мы добавили: VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    // Убираем /v1 из конца, если он есть (пути уже содержат /v1)
    let url = String(import.meta.env.VITE_API_URL).trim();
    // Убираем trailing slash и /v1 если есть
    url = url.replace(/\/v1\/?$/, ''); // Убирает '/v1' или '/v1/'
    return url;
  }
  
  // 2. Если мы в режиме разработки (npm run dev)
  if (import.meta.env.DEV) {
    return 'https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev';
  }
  
  // 3. Твой реальный рабочий Production API (актуальный endpoint после деплоя)
  // Stage (/prod) должен быть включен в baseURL
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
    
    // #region agent log
    const logDataInterceptor = {location:'client.ts:51',message:'Response interceptor error',data:{status:error.response?.status,url:originalRequest?.url,method:originalRequest?.method,isLoginRequest:originalRequest?.url?.includes('/auth/login')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataInterceptor)}).catch(()=>{});
    const logsInterceptor = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logsInterceptor.push(logDataInterceptor);
    localStorage.setItem('debug_logs', JSON.stringify(logsInterceptor.slice(-50)));
    // #endregion

    // Don't intercept 409 (Conflict) or other non-auth errors
    // Only handle 401 (Unauthorized) for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // #region agent log
      const logData = {location:'client.ts:54',message:'401 error detected, attempting refresh',data:{url:originalRequest.url,method:originalRequest.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
      const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs.push(logData);
      localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
      // #endregion
      originalRequest._retry = true;

      try {
        // Попытка обновить токен
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {}, { withCredentials: true });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если refresh не удался, перенаправляем на логин
        // #region agent log
        const logData2 = {location:'client.ts:68',message:'Refresh failed, redirecting to login',data:{url:originalRequest.url,isLoginRequest:originalRequest.url?.includes('/auth/login')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
        const logs2 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs2.push(logData2);
        localStorage.setItem('debug_logs', JSON.stringify(logs2.slice(-50)));
        // #endregion
        localStorage.removeItem('access_token');
        // Don't redirect if this is already a login request (to avoid infinite loop)
        // Check for both /auth/login and /v1/auth/login (after refactoring)
        if (!originalRequest.url?.includes('/auth/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


