import React, { useState, useEffect } from 'react';
import { Button, Avatar, Tag, message } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    LoginOutlined,
    LogoutOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { attendanceApi, type AttendanceDto } from '../../api/attendanceApi';

const HomeSubMenu: React.FC = () => {
    const { user } = useAuthStore();
    const [attendance, setAttendance] = useState<AttendanceDto | null>(null);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const todayStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayStr = dayNames[now.getDay()];

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await attendanceApi.getTodayAttendance();
                // 204 No Content means no record for today
                if (res.data) {
                    setAttendance(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch today's attendance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const formatTime = (dateString?: string | null) => {
        if (!dateString) return '--:--';
        const d = new Date(dateString);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const handleClockIn = async () => {
        try {
            const res = await attendanceApi.clockIn();
            setAttendance(res.data);
            message.success('출근 처리되었습니다.');
        } catch (err: any) {
            message.error(err.response?.data?.message || '출근 처리에 실패했습니다.');
        }
    };

    const handleClockOut = async () => {
        try {
            const res = await attendanceApi.clockOut();
            setAttendance(res.data);
            message.success('퇴근 처리되었습니다.');
        } catch (err: any) {
            message.error(err.response?.data?.message || '퇴근 처리에 실패했습니다.');
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 12 }}>
            {/* ─── 직원 프로필 ─── */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    overflow: 'auto',
                }}
            >
                <Avatar
                    size={72}
                    icon={<UserOutlined />}
                    style={{
                        background: 'linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)',
                        marginBottom: 14,
                        fontSize: 28,
                    }}
                />
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {user?.name || '사용자'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {user?.employee?.department?.name || '소속 부서 없음'}
                </div>
                {user?.employee?.position && (
                    <Tag
                        style={{
                            background: '#F0FAF8',
                            color: 'var(--primary)',
                            border: '1px solid #B2DFDB',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                        }}
                    >
                        {user.employee.position}
                    </Tag>
                )}

                <div
                    style={{
                        marginTop: 18,
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <MailOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                        {user?.email || '이메일 없음'}
                    </div>
                    {user?.employee?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <PhoneOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                            {user.employee.phone}
                        </div>
                    )}
                    {user?.employee?.officeLocation && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <EnvironmentOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                            {user.employee.officeLocation}
                        </div>
                    )}
                </div>

                {/* ─── 새 소식 요약 ─── */}
                <div
                    style={{
                        marginTop: 16,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-around',
                        background: '#FAFAFA',
                        padding: '12px 0',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                    }}
                >
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>오늘 온 메일</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>3개</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>오늘의 일정</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>2개</div>
                    </div>
                </div>
            </div>

            {/* ─── 근태관리 ─── */}
            <div style={{ flex: 1, borderTop: '1px solid var(--border)', paddingTop: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <ClockCircleOutlined style={{ color: 'var(--primary)', fontSize: 16 }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>근태관리</span>
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '12px 0',
                        marginBottom: 14,
                        background: '#FAFAFA',
                        borderRadius: 6,
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {todayStr} ({dayStr})
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {attendance?.clockOutTime ? '퇴근 완료' : attendance?.clockInTime ? '근무 중' : '출근 전'}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1, padding: '4px 0' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>출근</div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: attendance?.clockInTime ? 'var(--primary)' : '#ccc' }}>
                            {formatTime(attendance?.clockInTime)}
                        </div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center', flex: 1, padding: '4px 0' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>퇴근</div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: attendance?.clockOutTime ? '#FF4D4F' : '#ccc' }}>
                            {formatTime(attendance?.clockOutTime)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        type="primary"
                        icon={<LoginOutlined />}
                        block
                        disabled={loading || !!attendance}
                        onClick={handleClockIn}
                        style={{ height: 38, fontWeight: 500, fontSize: 13 }}
                    >
                        출근
                    </Button>
                    <Button
                        danger
                        icon={<LogoutOutlined />}
                        block
                        disabled={loading || !attendance || !!attendance?.clockOutTime}
                        onClick={handleClockOut}
                        style={{ height: 38, fontWeight: 500, fontSize: 13 }}
                    >
                        퇴근
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HomeSubMenu;
