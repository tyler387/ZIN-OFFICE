import React, { useState } from 'react';
import { Button, Avatar, Tag } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    LoginOutlined,
    LogoutOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

const HomeSubMenu: React.FC = () => {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState<string | null>(null);
    const [clockOutTime, setClockOutTime] = useState<string | null>(null);

    const now = new Date();
    const todayStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayStr = dayNames[now.getDay()];

    const handleClockIn = () => {
        const t = new Date();
        setClockInTime(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
        setIsClockedIn(true);
    };

    const handleClockOut = () => {
        const t = new Date();
        setClockOutTime(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
        setIsClockedIn(false);
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
                    홍길동
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    IT서비스 부문 · 개발팀
                </div>
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
                    선임 개발자
                </Tag>

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
                        hong@company.com
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <PhoneOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                        010-1234-5678
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <EnvironmentOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                        본사 12층
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
                        {isClockedIn ? '근무 중' : clockOutTime ? '퇴근 완료' : '출근 전'}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1, padding: '4px 0' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>출근</div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: clockInTime ? 'var(--primary)' : '#ccc' }}>
                            {clockInTime || '--:--'}
                        </div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center', flex: 1, padding: '4px 0' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>퇴근</div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: clockOutTime ? '#FF4D4F' : '#ccc' }}>
                            {clockOutTime || '--:--'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        type="primary"
                        icon={<LoginOutlined />}
                        block
                        disabled={isClockedIn || !!clockOutTime}
                        onClick={handleClockIn}
                        style={{ height: 38, fontWeight: 500, fontSize: 13 }}
                    >
                        출근
                    </Button>
                    <Button
                        danger
                        icon={<LogoutOutlined />}
                        block
                        disabled={!isClockedIn}
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
