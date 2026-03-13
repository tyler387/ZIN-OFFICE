import React, { useState } from 'react';
import { Avatar, Card, List, Tag } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    LeftOutlined,
    MailOutlined,
    ReadOutlined,
    RightOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useResponsive } from '../hooks/useResponsive';

const recentPosts = [
    { key: '1', title: '3월 정기 점검 안내', author: '관리자', date: '03-05', board: '공지' },
    { key: '2', title: '보안 교육 이수 안내', author: '보안팀', date: '03-04', board: '공지' },
    { key: '3', title: '점심 모임 참석 조사', author: '김대리', date: '03-04', board: '자유' },
    { key: '4', title: '동호회 신규 회원 모집', author: '이사원', date: '03-03', board: '자유' },
];

const recentMails = [
    { key: '1', from: '김대리', subject: '프로젝트 회의 일정 요청', time: '10:32', unread: true },
    { key: '2', from: '이과장', subject: '주간 보고서 검토 요청', time: '09:15', unread: true },
    { key: '3', from: '박주임', subject: 'RE: 서버 증설 요청', time: '어제', unread: false },
    { key: '4', from: '최사원', subject: '교육 신청 확인', time: '어제', unread: false },
];

const pendingApprovals = [
    { key: '1', id: 'AP-001', title: '출장 경비 신청', author: '김대리', date: '03-05' },
    { key: '2', id: 'AP-002', title: '예산 증액 요청', author: '이과장', date: '03-04' },
    { key: '3', id: 'AP-003', title: '비품 구매 요청', author: '박주임', date: '03-04' },
];

const scheduleEvents = [
    { date: 5, title: '주간 회의', time: '10:00 - 11:00', color: '#00897B' },
    { date: 7, title: '중간 점검 회의', time: '14:00 - 15:30', color: '#1677FF' },
    { date: 12, title: '전사 미팅', time: '16:00 - 17:00', color: '#722ED1' },
    { date: 20, title: '분기 보고', time: '09:00 - 10:00', color: '#FAAD14' },
];

const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
};

const HomePage: React.FC = () => {
    const { isMobile, isTablet } = useResponsive();

    return (
        <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: 16, height: isTablet ? 'auto' : '100%', paddingBottom: isTablet ? 8 : 0 }}>
            <div style={{ flex: isTablet ? 'none' : 4, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                <Card style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? '14px' : '16px 20px' } }}>
                    <div style={sectionHeaderStyle}>
                        <ReadOutlined style={{ color: 'var(--primary)' }} />
                        최근 게시글
                    </div>
                    <List
                        dataSource={recentPosts}
                        split={false}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <Tag
                                            style={{
                                                fontSize: 10,
                                                padding: '0 4px',
                                                lineHeight: '18px',
                                                borderRadius: 3,
                                                background: item.board === 'Notice' ? '#FFF7E6' : '#F0FAF8',
                                                color: item.board === 'Notice' ? '#D48806' : 'var(--primary)',
                                                border: 'none',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.board}
                                        </Tag>
                                        <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {item.author} / {item.date}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                <Card style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? '14px' : '16px 20px' } }}>
                    <div style={sectionHeaderStyle}>
                        <MailOutlined style={{ color: 'var(--primary)' }} />
                        최근 메일
                    </div>
                    <List
                        dataSource={recentMails}
                        split={false}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minWidth: 0 }}>
                                    <Avatar
                                        size={30}
                                        icon={<UserOutlined />}
                                        style={{ background: item.unread ? 'var(--primary)' : '#d9d9d9', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: isMobile ? 'flex-start' : 'center',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                gap: isMobile ? 2 : 0,
                                            }}
                                        >
                                            <span style={{ fontSize: 13, fontWeight: item.unread ? 600 : 400 }}>
                                                {item.from}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: item.unread ? 'var(--text-secondary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.subject}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                <Card style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? '14px' : '16px 20px' } }}>
                    <div style={sectionHeaderStyle}>
                        <FileTextOutlined style={{ color: 'var(--primary)' }} />
                        대기 중인 결재
                    </div>
                    <List
                        dataSource={pendingApprovals}
                        split={false}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <ClockCircleOutlined style={{ fontSize: 12, color: '#1677FF' }} />
                                        <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 18 }}>
                                        {item.author} / {item.date} / {item.id}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>

            <div style={{ flex: isTablet ? 'none' : 1, minWidth: isTablet ? 0 : 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <CalendarWidget isMobile={isMobile} />
            </div>
        </div>
    );
};

const CalendarWidget: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    const monthLabel = `${viewYear}.${String(viewMonth + 1).padStart(2, '0')}`;
    const eventDates = new Set(scheduleEvents.map((event) => event.date));

    const isToday = (day: number) =>
        viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear((year) => year - 1);
            setViewMonth(11);
            return;
        }

        setViewMonth((month) => month - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear((year) => year + 1);
            setViewMonth(0);
            return;
        }

        setViewMonth((month) => month + 1);
    };

    const goToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
    };

    const cells: Array<number | null> = [];
    for (let index = 0; index < firstDayOfWeek; index += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0, overflow: 'hidden' } }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: 'var(--primary)', fontSize: 15 }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{monthLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div onClick={prevMonth} style={navBtnStyle}><LeftOutlined style={{ fontSize: 11 }} /></div>
                    <div onClick={goToday} style={{ ...navBtnStyle, width: 'auto', padding: '2px 8px', borderRadius: 4 }}>오늘</div>
                    <div onClick={nextMonth} style={navBtnStyle}><RightOutlined style={{ fontSize: 11 }} /></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 6px' }}>
                {dayLabels.map((label, index) => (
                    <div
                        key={label}
                        style={{
                            textAlign: 'center',
                            fontSize: 11,
                            fontWeight: 500,
                            color: index === 0 ? '#FF4D4F' : index === 6 ? '#1677FF' : 'var(--text-muted)',
                            padding: '2px 0',
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: '1px 0' }}>
                {cells.map((day, index) => {
                    const dayOfWeek = index % 7;
                    const hasEvent = day !== null && eventDates.has(day);
                    const todayMatch = day !== null && isToday(day);

                    return (
                        <div
                            key={`${day ?? 'empty'}-${index}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: isMobile ? '6px 0' : '4px 0',
                                minHeight: isMobile ? 34 : 28,
                            }}
                        >
                            {day !== null && (
                                <>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            fontSize: 12,
                                            fontWeight: todayMatch ? 700 : 400,
                                            color: todayMatch ? '#fff' : dayOfWeek === 0 ? '#FF4D4F' : dayOfWeek === 6 ? '#1677FF' : 'var(--text-primary)',
                                            background: todayMatch ? 'var(--primary)' : 'transparent',
                                        }}
                                    >
                                        {day}
                                    </span>
                                    {hasEvent && (
                                        <span
                                            style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                background: todayMatch ? '#fff' : 'var(--primary)',
                                                marginTop: 2,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>예정 일정</div>
                {scheduleEvents.map((event) => (
                    <div key={`${event.date}-${event.title}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
                        <div style={{ width: 3, height: 28, borderRadius: 2, background: event.color, flexShrink: 0, marginTop: 1 }} />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.title}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {viewMonth + 1}/{event.date} / {event.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const navBtnStyle: React.CSSProperties = {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '50%',
    color: '#666',
    transition: 'background 0.12s',
};

export default HomePage;
