import React, { useState } from 'react';
import { Card, List, Tag, Avatar } from 'antd';
import {
    FileTextOutlined,
    MailOutlined,
    ReadOutlined,
    UserOutlined,
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
} from '@ant-design/icons';

/* ─── 더미 데이터 ─── */
const recentPosts = [
    { key: '1', title: '[공지] 2026년 3월 정기점검 안내', author: '관리자', date: '03-05', board: '공지' },
    { key: '2', title: '[공지] 사내 보안 교육 필수 이수 안내', author: '보안팀', date: '03-04', board: '공지' },
    { key: '3', title: '금요일 회식 참석 여부 확인', author: '김철수', date: '03-04', board: '자유' },
    { key: '4', title: '사내 동호회 모집합니다', author: '이영희', date: '03-03', board: '자유' },
    { key: '5', title: 'VPN 연결 관련 문의드립니다', author: '박민수', date: '03-02', board: 'Q&A' },
];

const recentMails = [
    { key: '1', from: '김철수', subject: '프로젝트 일정 관련 회의', time: '10:32', unread: true },
    { key: '2', from: '이영희', subject: '주간 보고서 검토 요청', time: '09:15', unread: true },
    { key: '3', from: '박민수', subject: 'Re: 서버 증설 요청 건', time: '어제', unread: false },
    { key: '4', from: '최지연', subject: '외부 교육 신청서 확인', time: '어제', unread: false },
    { key: '5', from: '강서연', subject: '디자인 시안 공유', time: '03/03', unread: false },
];

const pendingApprovals = [
    { key: '1', id: 'AP-001', title: '출장 경비 신청', author: '김철수', status: '진행', date: '03-05' },
    { key: '2', id: 'AP-002', title: '연차 휴가 신청', author: '이영희', status: '진행', date: '03-04' },
    { key: '3', id: 'AP-003', title: '물품 구매 요청서', author: '박민수', status: '진행', date: '03-04' },
    { key: '4', id: 'AP-006', title: '외부 교육 신청', author: '강서연', status: '진행', date: '03-02' },
    { key: '5', id: 'AP-008', title: '서버 증설 요청', author: '김철수', status: '진행', date: '02-28' },
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
    return (
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
            {/* ═══ 3/4 영역: 세로 3등분 ═══ */}
            <div style={{ flex: 4, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, overflow: 'hidden' }}>

                {/* ─── 게시판 최근 글 ─── */}
                <Card
                    style={{ flex: 1, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    styles={{ body: { flex: 1, padding: '16px 20px', overflow: 'auto', display: 'flex', flexDirection: 'column' } }}
                >
                    <div style={sectionHeaderStyle}>
                        <ReadOutlined style={{ color: 'var(--primary)' }} />
                        게시판 최근 글
                    </div>
                    <List
                        dataSource={recentPosts}
                        split={false}
                        renderItem={(item) => (
                            <List.Item
                                style={{ padding: '8px 0', cursor: 'pointer', border: 'none' }}
                            >
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <Tag
                                            style={{
                                                fontSize: 10,
                                                padding: '0 4px',
                                                lineHeight: '18px',
                                                borderRadius: 3,
                                                background: item.board === '공지' ? '#FFF7E6' : '#F0FAF8',
                                                color: item.board === '공지' ? '#D48806' : 'var(--primary)',
                                                border: 'none',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.board}
                                        </Tag>
                                        <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {item.author} · {item.date}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                {/* ─── 메일함 ─── */}
                <Card
                    style={{ flex: 1, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    styles={{ body: { flex: 1, padding: '16px 20px', overflow: 'auto', display: 'flex', flexDirection: 'column' } }}
                >
                    <div style={sectionHeaderStyle}>
                        <MailOutlined style={{ color: 'var(--primary)' }} />
                        메일함
                    </div>
                    <List
                        dataSource={recentMails}
                        split={false}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '8px 0', cursor: 'pointer', border: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minWidth: 0 }}>
                                    <Avatar
                                        size={30}
                                        icon={<UserOutlined />}
                                        style={{ background: item.unread ? 'var(--primary)' : '#d9d9d9', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: item.unread ? 600 : 400, color: 'var(--text-primary)' }}>
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

                {/* ─── 결재 대기 문서 ─── */}
                <Card
                    style={{ flex: 1, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    styles={{ body: { flex: 1, padding: '16px 20px', overflow: 'auto', display: 'flex', flexDirection: 'column' } }}
                >
                    <div style={sectionHeaderStyle}>
                        <FileTextOutlined style={{ color: 'var(--primary)' }} />
                        결재 대기 문서
                    </div>
                    <List
                        dataSource={pendingApprovals}
                        split={false}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '8px 0', cursor: 'pointer', border: 'none' }}>
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <ClockCircleOutlined style={{ fontSize: 12, color: '#1677FF' }} />
                                        <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 18 }}>
                                        {item.author} · {item.date} · {item.id}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>

            {/* ═══ 나머지 1/4 — 캘린더 위젯 ═══ */}
            <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <CalendarWidget />
            </div>
        </div>
    );
};

/* ═══ 캘린더 위젯 ═══ */
const scheduleEvents = [
    { date: 5, title: '주간 팀 미팅', time: '10:00 - 11:00', color: '#00897B' },
    { date: 7, title: '프로젝트 중간 점검', time: '14:00 - 15:30', color: '#1677FF' },
    { date: 12, title: '전사 타운홀 미팅', time: '16:00 - 17:00', color: '#722ED1' },
    { date: 15, title: '정기 점검 (서비스 중단)', time: '02:00 - 06:00', color: '#FF4D4F' },
    { date: 20, title: '분기 실적 보고', time: '09:00 - 10:00', color: '#FAAD14' },
];

const eventDates = new Set(scheduleEvents.map(e => e.date));

const CalendarWidget: React.FC = () => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;

    const isToday = (day: number) =>
        viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const goToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
    };

    // 현재 월 일정만 필터
    const currentMonthEvents = (viewYear === today.getFullYear() && viewMonth === today.getMonth())
        ? scheduleEvents.filter(e => e.date >= today.getDate()).slice(0, 4)
        : scheduleEvents.slice(0, 4);

    // 날짜 셀 배열
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Card
            style={{ borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            styles={{ body: { flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
        >
            {/* 헤더: 월 네비게이션 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px 10px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: 'var(--primary)', fontSize: 15 }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{monthLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div onClick={prevMonth} style={navBtnStyle}><LeftOutlined style={{ fontSize: 11 }} /></div>
                    <div onClick={goToday} style={{ ...navBtnStyle, fontSize: 11, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', width: 'auto' }}>오늘</div>
                    <div onClick={nextMonth} style={navBtnStyle}><RightOutlined style={{ fontSize: 11 }} /></div>
                </div>
            </div>

            {/* 요일 헤더 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 6px', gap: 0 }}>
                {dayLabels.map((d, i) => (
                    <div
                        key={d}
                        style={{
                            textAlign: 'center',
                            fontSize: 11,
                            fontWeight: 500,
                            color: i === 0 ? '#FF4D4F' : i === 6 ? '#1677FF' : 'var(--text-muted)',
                            padding: '2px 0',
                        }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 날짜 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: '1px 0', flex: 1 }}>
                {cells.map((day, idx) => {
                    const colIdx = idx % 7;
                    const isSunday = colIdx === 0;
                    const isSaturday = colIdx === 6;
                    const hasEvent = day !== null && eventDates.has(day);
                    const todayMatch = day !== null && isToday(day);

                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '3px 0',
                                cursor: day ? 'pointer' : 'default',
                                borderRadius: 6,
                                transition: 'background 0.12s',
                                position: 'relative',
                            }}
                            onMouseEnter={e => { if (day && !todayMatch) e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={e => { if (day && !todayMatch) e.currentTarget.style.background = 'transparent'; }}
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
                                            color: todayMatch ? '#fff' : isSunday ? '#FF4D4F' : isSaturday ? '#1677FF' : 'var(--text-primary)',
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
                                                marginTop: 1,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 다가오는 일정 */}
            <div
                style={{
                    borderTop: '1px solid var(--border)',
                    padding: '10px 16px',
                    overflow: 'auto',
                }}
            >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    다가오는 일정
                </div>
                {currentMonthEvents.map((ev, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '6px 0',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                width: 3,
                                height: 28,
                                borderRadius: 2,
                                background: ev.color,
                                flexShrink: 0,
                                marginTop: 1,
                            }}
                        />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.title}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {viewMonth + 1}/{ev.date} · {ev.time}
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
