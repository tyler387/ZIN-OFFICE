import axios from 'axios';

/* ─── Axios 기본 인스턴스 ─── */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ─── 요청 인터셉터 ─── */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/* ─── 응답 인터셉터 ─── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
