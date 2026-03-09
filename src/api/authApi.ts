import api from './index';

export interface UserDto {
    id: number;
    email: string;
    name: string;
    role: string;
    department?: string;
    position?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

/* ─── 인증 API ─── */
export const authApi = {
    /** 로그인 */
    login: (email: string, password: string) =>
        api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

    /** 로그아웃 */
    logout: () =>
        api.post<ApiResponse<void>>('/auth/logout'),

    /** 현재 사용자 정보 */
    getMe: () =>
        api.get<ApiResponse<UserDto>>('/auth/me'),

    /** 토큰 갱신 */
    refreshToken: () =>
        api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
};
