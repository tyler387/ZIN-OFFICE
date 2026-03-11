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
    /** 출근 기록 */
    clockIn: () =>
        api.post<AttendanceDto>('/attendance/clock-in'),

    /** 퇴근 기록 */
    clockOut: () =>
        api.post<AttendanceDto>('/attendance/clock-out'),

    /** 오늘의 내 출퇴근 기록 조회 */
    getTodayAttendance: () =>
        api.get<AttendanceDto>('/attendance/today'),
};
