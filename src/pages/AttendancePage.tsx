import React, { useEffect, useMemo, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { LeftOutlined, RightOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { attendanceApi, type AttendanceDto } from '../api/attendanceApi';
import { useAttendanceStore } from '../store/attendanceStore';

const { Text } = Typography;

type RowItem = {
    key: string;
    date: string;
    status: string;
    clockIn: string;
    clockOut: string;
    worked: string;
};

const fmtTime = (v?: string | null) => {
    if (!v) return '-';
    const d = new Date(v);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const workedDuration = (inTime?: string | null, outTime?: string | null) => {
    if (!inTime || !outTime) return '-';
    const start = new Date(inTime).getTime();
    const end = new Date(outTime).getTime();
    const diff = Math.max(0, end - start);
    const totalMin = Math.floor(diff / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
};

const AttendancePage: React.FC = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [monthly, setMonthly] = useState<AttendanceDto[]>([]);
    const [loadingMonth, setLoadingMonth] = useState(false);

    const todayAttendance = useAttendanceStore((state) => state.todayAttendance);
    const loadingToday = useAttendanceStore((state) => state.loadingToday);
    const fetchTodayAttendance = useAttendanceStore((state) => state.fetchTodayAttendance);
    const clockIn = useAttendanceStore((state) => state.clockIn);
    const clockOut = useAttendanceStore((state) => state.clockOut);

    const loadMonth = async () => {
        setLoadingMonth(true);
        try {
            const res = await attendanceApi.getMonthlyAttendance(year, month);
            setMonthly(res.data ?? []);
        } catch (error: any) {
            message.error(error?.response?.data?.message || '월별 근태 조회에 실패했습니다.');
        } finally {
            setLoadingMonth(false);
        }
    };

    useEffect(() => {
        fetchTodayAttendance().catch(() => {});
    }, [fetchTodayAttendance]);

    useEffect(() => {
        loadMonth().catch(() => {});
    }, [year, month]);

    useEffect(() => {
        loadMonth().catch(() => {});
    }, [todayAttendance?.id, todayAttendance?.clockOutTime]);

    const rows: RowItem[] = useMemo(() => {
        return monthly.map((item) => ({
            key: String(item.id),
            date: item.workDate,
            status: item.status === 'LATE' ? '지각' : item.status === 'PRESENT' ? '정상' : '결근',
            clockIn: fmtTime(item.clockInTime),
            clockOut: fmtTime(item.clockOutTime),
            worked: workedDuration(item.clockInTime, item.clockOutTime),
        }));
    }, [monthly]);

    const handleClockIn = async () => {
        try {
            await clockIn();
            message.success('출근 처리되었습니다.');
        } catch (error: any) {
            message.error(error?.response?.data?.message || '출근 처리에 실패했습니다.');
        }
    };

    const handleClockOut = async () => {
        try {
            await clockOut();
            message.success('퇴근 처리되었습니다.');
        } catch (error: any) {
            message.error(error?.response?.data?.message || '퇴근 처리에 실패했습니다.');
        }
    };

    const prevMonth = () => {
        if (month === 1) {
            setYear((v) => v - 1);
            setMonth(12);
        } else {
            setMonth((v) => v - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            setYear((v) => v + 1);
            setMonth(1);
        } else {
            setMonth((v) => v + 1);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button type="primary" icon={<LoginOutlined />} disabled={loadingToday || !!todayAttendance} onClick={handleClockIn}>
                        출근
                    </Button>
                    <Button danger icon={<LogoutOutlined />} disabled={loadingToday || !todayAttendance || !!todayAttendance?.clockOutTime} onClick={handleClockOut}>
                        퇴근
                    </Button>
                    <Text type="secondary">
                        오늘: 출근 {fmtTime(todayAttendance?.clockInTime)} / 퇴근 {fmtTime(todayAttendance?.clockOutTime)}
                    </Text>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                <LeftOutlined onClick={prevMonth} style={{ cursor: 'pointer' }} />
                <Text strong>{year}.{String(month).padStart(2, '0')}</Text>
                <RightOutlined onClick={nextMonth} style={{ cursor: 'pointer' }} />
            </div>

            <Table
                rowKey="key"
                loading={loadingMonth}
                dataSource={rows}
                pagination={false}
                columns={[
                    { title: '날짜', dataIndex: 'date', key: 'date', width: 140 },
                    { title: '상태', dataIndex: 'status', key: 'status', width: 100 },
                    { title: '출근', dataIndex: 'clockIn', key: 'clockIn', width: 120 },
                    { title: '퇴근', dataIndex: 'clockOut', key: 'clockOut', width: 120 },
                    { title: '근무시간', dataIndex: 'worked', key: 'worked', width: 140 },
                ]}
                locale={{ emptyText: '근태 기록이 없습니다.' }}
            />
        </div>
    );
};

export default AttendancePage;
