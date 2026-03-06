import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
import {
    RightOutlined,
    DownOutlined,
    NotificationOutlined,
} from '@ant-design/icons';

const AttendanceSubMenu: React.FC = () => {
    const [attendanceOpen, setAttendanceOpen] = useState(true);
    const [isClockedIn, setIsClockedIn] = useState(true);
    const [clockInTime] = useState('08:55:19');
    const [clockOutTime, setClockOutTime] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    // 실시간 시계
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const now = currentTime;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayStr = dayNames[now.getDay()];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const handleClockOut = () => {
        const t = new Date();
        setClockOutTime(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`);
        setIsClockedIn(false);
    };

    const items = [
        { label: '내 근태 현황', path: '/attendance/status' },
        { label: '내 연차 내역', path: '/attendance/leave' },
        { label: '내 인사정보', path: '/attendance/profile' },
    ];

    const workMenuItems = [
        { key: '1', label: '일반 업무' },
        { key: '2', label: '외근' },
        { key: '3', label: '출장' },
        { key: '4', label: '재택근무' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 상단: 시계 + 근태 정보 */}
            <div style={{ padding: '24px 20px 18px', textAlign: 'center' }}>
                {/* 제목 */}
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                    근태관리
                </div>

                {/* 날짜 */}
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                    {dateStr}({dayStr})
                </div>

                {/* 실시간 시계 */}
                <div style={{
                    fontSize: 38,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: 2,
                    marginBottom: 24,
                    lineHeight: 1.2,
                }}>
                    {timeStr}
                </div>

                {/* 근무 정보 */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, padding: '0 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>출근시간</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{clockInTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>퇴근시간</span>
                        <span style={{ color: clockOutTime ? 'var(--text-primary)' : '#bbb', fontWeight: 500 }}>
                            {clockOutTime || '미등록'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>주간 누적 근무시간</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>24h 47m 16s</span>
                    </div>
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Button
                        block
                        disabled={isClockedIn}
                        style={{
                            height: 40,
                            borderRadius: 20,
                            fontWeight: 500,
                            fontSize: 13,
                        }}
                    >
                        출근하기
                    </Button>
                    <Button
                        block
                        type={isClockedIn ? 'primary' : 'default'}
                        disabled={!isClockedIn}
                        onClick={handleClockOut}
                        style={{
                            height: 40,
                            borderRadius: 20,
                            fontWeight: 500,
                            fontSize: 13,
                        }}
                    >
                        퇴근하기
                    </Button>
                </div>

                {/* 업무 드롭다운 */}
                <Dropdown menu={{ items: workMenuItems }} trigger={['click']}>
                    <Button
                        block
                        style={{
                            height: 40,
                            borderRadius: 20,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)',
                        }}
                    >
                        업무 <DownOutlined style={{ fontSize: 10 }} />
                    </Button>
                </Dropdown>
            </div>

            {/* 구분선 */}
            <div style={{ borderTop: '1px solid var(--submenu-border)', margin: '0 16px' }} />

            {/* 하단 메뉴 */}
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
                <div
                    style={{
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#666',
                        cursor: 'pointer',
                        letterSpacing: 0.3,
                        userSelect: 'none',
                    }}
                    onClick={() => setAttendanceOpen(!attendanceOpen)}
                >
                    {attendanceOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>근태관리</span>
                </div>
                {attendanceOpen && items.map(item => {
                    const active = currentPath === item.path;
                    return (
                        <div
                            key={item.path}
                            style={{
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px 0 28px',
                                fontSize: 13,
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                                background: active ? 'var(--submenu-active-bg)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                            }}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--submenu-active-bg)' : 'transparent'; }}
                        >
                            {item.label}
                        </div>
                    );
                })}
            </div>

            {/* 하단 공지 */}
            <div style={{
                padding: '14px 16px',
                borderTop: '1px solid var(--submenu-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--primary)',
                flexShrink: 0,
            }}>
                <NotificationOutlined style={{ fontSize: 13 }} />
                <span>신규 근태관리 유연근무제 적용!</span>
            </div>
        </div>
    );
};

export default AttendanceSubMenu;
