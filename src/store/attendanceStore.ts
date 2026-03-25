import { create } from 'zustand';
import { attendanceApi, type AttendanceDto } from '../api/attendanceApi';

interface AttendanceState {
    todayAttendance: AttendanceDto | null;
    loadingToday: boolean;
    fetchTodayAttendance: () => Promise<void>;
    clockIn: () => Promise<AttendanceDto>;
    clockOut: () => Promise<AttendanceDto>;
    setTodayAttendance: (attendance: AttendanceDto | null) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    todayAttendance: null,
    loadingToday: false,

    setTodayAttendance: (attendance) => set({ todayAttendance: attendance }),

    fetchTodayAttendance: async () => {
        set({ loadingToday: true });
        try {
            const res = await attendanceApi.getTodayAttendance();
            set({ todayAttendance: res.data });
        } catch (error: any) {
            if (error?.response?.status === 204) {
                set({ todayAttendance: null });
            } else {
                throw error;
            }
        } finally {
            set({ loadingToday: false });
        }
    },

    clockIn: async () => {
        const res = await attendanceApi.clockIn();
        set({ todayAttendance: res.data });
        return res.data;
    },

    clockOut: async () => {
        const res = await attendanceApi.clockOut();
        set({ todayAttendance: res.data });
        return res.data;
    },
}));
