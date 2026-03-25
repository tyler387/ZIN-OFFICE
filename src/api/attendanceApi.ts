import api from './index';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface AttendanceDto {
    id: number;
    workDate: string;
    clockInTime: string;
    clockOutTime: string | null;
    status: AttendanceStatus;
}

export const attendanceApi = {
    clockIn: () => api.post<AttendanceDto>('/attendance/clock-in'),

    clockOut: () => api.post<AttendanceDto>('/attendance/clock-out'),

    getTodayAttendance: () => api.get<AttendanceDto>('/attendance/today'),

    getMonthlyAttendance: (year: number, month: number) =>
        api.get<AttendanceDto[]>('/attendance/month', { params: { year, month } }),
};
