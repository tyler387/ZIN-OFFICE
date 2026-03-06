import api from './index';

/* ─── 인증 API ─── */
export const authApi = {
    /** 로그인 */
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    /** 로그아웃 */
    logout: () =>
        api.post('/auth/logout'),

    /** 현재 사용자 정보 */
    getMe: () =>
        api.get('/auth/me'),

    /** 토큰 갱신 */
    refreshToken: () =>
        api.post('/auth/refresh'),
};
