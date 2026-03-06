import React, { useState } from 'react';
import { Button } from 'antd';
import {
    LeftOutlined,
    RightOutlined,
    DownOutlined,
    DownloadOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';

type WeekData = {
    week: number;
    accumulated: string;
    overtime: string;
    days: {
        date: string;
        dayName: string;
        clockIn: string | null;
        clockOut: string | null;
        totalWork: string;
        overtime: string;
        status: 'normal' | 'late' | 'absent' | 'holiday' | 'weekend';
    }[];
};

const dummyWeeks: WeekData[] = [
    {
        week: 1,
        accumulated: '32h 29m 52s',
        overtime: '0h 29m 52s',
        days: [
            { date: '03.01', dayName: '토', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'weekend' },
            { date: '03.02', dayName: '일', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'weekend' },
            { date: '03.03', dayName: '월', clockIn: '08:52:14', clockOut: '18:12:33', totalWork: '8h 20m 19s', overtime: '0h 12m 33s', status: 'normal' },
            { date: '03.04', dayName: '화', clockIn: '08:48:07', clockOut: '18:05:21', totalWork: '8h 17m 14s', overtime: '0h 5m 21s', status: 'normal' },
            { date: '03.05', dayName: '수', clockIn: '08:55:19', clockOut: '18:08:44', totalWork: '8h 13m 25s', overtime: '0h 8m 44s', status: 'normal' },
            { date: '03.06', dayName: '목', clockIn: '08:55:19', clockOut: null, totalWork: '-', overtime: '-', status: 'normal' },
            { date: '03.07', dayName: '금', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'normal' },
        ],
    },
    {
        week: 2,
        accumulated: '24h 47m 16s',
        overtime: '0h 47m 16s',
        days: [
            { date: '03.08', dayName: '토', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'weekend' },
            { date: '03.09', dayName: '일', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'weekend' },
            { date: '03.10', dayName: '월', clockIn: '09:01:22', clockOut: '18:15:40', totalWork: '8h 14m 18s', overtime: '0h 15m 40s', status: 'late' },
            { date: '03.11', dayName: '화', clockIn: '08:45:11', clockOut: '18:22:05', totalWork: '8h 36m 54s', overtime: '0h 22m 5s', status: 'normal' },
            { date: '03.12', dayName: '수', clockIn: '08:50:33', clockOut: '18:06:17', totalWork: '8h 15m 44s', overtime: '0h 6m 17s', status: 'normal' },
            { date: '03.13', dayName: '목', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'normal' },
            { date: '03.14', dayName: '금', clockIn: null, clockOut: null, totalWork: '-', overtime: '-', status: 'normal' },
        ],
    },
    { week: 3, accumulated: '0h 0m 0s', overtime: '0h 0m 0s', days: [] },
    { week: 4, accumulated: '0h 0m 0s', overtime: '0h 0m 0s', days: [] },
    { week: 5, accumulated: '0h 0m 0s', overtime: '0h 0m 0s', days: [] },
    { week: 6, accumulated: '0h 0m 0s', overtime: '0h 0m 0s', days: [] },
];

const AttendancePage: React.FC = () => {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(3);
    const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);

    const handlePrevMonth = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };
    const handleNextMonth = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };
    const handleToday = () => {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth() + 1);
    };

    const toggleWeek = (week: number) => {
        setExpandedWeeks(prev =>
            prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
        );
    };

    const summaryCards = [
        { label: '이번주 누적', value: '24h 47m 16s', color: 'var(--text-primary)' },
        { label: '이번주 초과', value: '0h 47m 16s', color: 'var(--text-primary)' },
        { label: '이번주 잔여', value: '15h 12m 44s', highlight: true },
        { label: '이번달 누적', value: '24h 47m 16s', muted: true },
        { label: '이번달 연장', value: '0h 47m 16s', muted: true },
    ];

    return (
        <div>
            {/* 월 네비게이션 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 24,
            }}>
                <LeftOutlined
                    style={{ fontSize: 14, color: '#999', cursor: 'pointer' }}
                    onClick={handlePrevMonth}
                />
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {year}.{String(month).padStart(2, '0')}
                </span>
                <RightOutlined
                    style={{ fontSize: 14, color: '#999', cursor: 'pointer' }}
                    onClick={handleNextMonth}
                />
                <span
                    style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 4 }}
                    onClick={handleToday}
                >
                    오늘
                </span>
            </div>

            {/* 기본그룹 + 다운로드 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>기본그룹</span>
                    <span>09:00:00 ~ 18:00:00</span>
                    <InfoCircleOutlined style={{ fontSize: 12, color: '#bbb' }} />
                </div>
                <Button size="small" icon={<DownloadOutlined />} style={{ fontSize: 12 }}>
                    목록 다운로드
                </Button>
            </div>

            {/* 요약 카드 */}
            <div style={{
                display: 'flex',
                borderRadius: 8,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                marginBottom: 24,
            }}>
                {summaryCards.map((card, idx) => (
                    <div
                        key={idx}
                        style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '18px 12px',
                            borderRight: idx < summaryCards.length - 1 ? '1px solid var(--border)' : 'none',
                            background: card.highlight ? '#F0FAF8' : '#fff',
                        }}
                    >
                        <div style={{
                            fontSize: 11,
                            color: card.highlight ? 'var(--primary)' : card.muted ? '#999' : 'var(--text-muted)',
                            marginBottom: 8,
                            fontWeight: 500,
                        }}>
                            {card.label}
                        </div>
                        <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: card.highlight ? 'var(--primary)' : card.muted ? '#888' : 'var(--text-primary)',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* 주차별 아코디언 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {dummyWeeks.map(weekData => {
                    const isExpanded = expandedWeeks.includes(weekData.week);
                    return (
                        <div key={weekData.week}>
                            {/* 주차 헤더 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '14px 16px',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                                onClick={() => toggleWeek(weekData.week)}
                            >
                                <DownOutlined
                                    style={{
                                        fontSize: 10,
                                        color: '#999',
                                        marginRight: 8,
                                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {weekData.week} 주차
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                                    누적 근무시간 {weekData.accumulated}
                                    <span style={{ color: '#bbb', marginLeft: 8, fontSize: 12 }}>
                                        (초과 근무시간 {weekData.overtime})
                                    </span>
                                </span>
                            </div>

                            {/* 주차 상세 */}
                            {isExpanded && weekData.days.length > 0 && (
                                <div style={{ background: '#FAFAFA' }}>
                                    {/* 테이블 헤더 */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '80px 60px 110px 110px 130px 130px 1fr',
                                        padding: '10px 16px 10px 40px',
                                        fontSize: 11,
                                        color: '#999',
                                        fontWeight: 600,
                                        borderBottom: '1px solid #eee',
                                    }}>
                                        <span>날짜</span>
                                        <span>요일</span>
                                        <span>출근</span>
                                        <span>퇴근</span>
                                        <span>근무시간</span>
                                        <span>초과근무</span>
                                        <span>비고</span>
                                    </div>

                                    {/* 일별 데이터 */}
                                    {weekData.days.map(day => (
                                        <div
                                            key={day.date}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '80px 60px 110px 110px 130px 130px 1fr',
                                                padding: '10px 16px 10px 40px',
                                                fontSize: 13,
                                                borderBottom: '1px solid #f0f0f0',
                                                color: day.status === 'weekend' ? '#ccc' : 'var(--text-primary)',
                                                background: day.status === 'weekend' ? '#f8f8f8' : 'transparent',
                                            }}
                                        >
                                            <span>{day.date}</span>
                                            <span style={{
                                                color: day.dayName === '토' ? '#1890ff' : day.dayName === '일' ? '#ff4d4f' : 'inherit',
                                            }}>
                                                {day.dayName}
                                            </span>
                                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                {day.clockIn || '-'}
                                            </span>
                                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                {day.clockOut || '-'}
                                            </span>
                                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                {day.totalWork}
                                            </span>
                                            <span style={{
                                                fontVariantNumeric: 'tabular-nums',
                                                color: day.overtime !== '-' && day.overtime !== '0h 0m 0s' ? '#FF7A45' : 'inherit',
                                            }}>
                                                {day.overtime}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#999' }}>
                                                {day.status === 'late' && <span style={{ color: '#FF4D4F', fontWeight: 500 }}>지각</span>}
                                                {day.status === 'weekend' && '주말'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttendancePage;
