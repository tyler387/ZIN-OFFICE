import React, { useState } from 'react';
import { Button, Badge } from 'antd';
import { LeftOutlined, RightOutlined, UnorderedListOutlined } from '@ant-design/icons';

/* ─── 더미 일정 데이터 ─── */
type CalEvent = {
    date: string;       // YYYY-MM-DD
    title: string;
    color: string;
    time?: string;
};

const dummyEvents: CalEvent[] = [
    { date: '2026-03-03', title: '주간 팀 미팅', color: '#FF9800', time: '10:00' },
    { date: '2026-03-03', title: '보안 교육 이수', color: '#F44336', time: '14:00' },
    { date: '2026-03-05', title: '신규 프로젝트 킥오프', color: '#2196F3', time: '09:00' },
    { date: '2026-03-05', title: '점심 회식', color: '#4CAF50', time: '12:00' },
    { date: '2026-03-06', title: '1:1 면담', color: '#9C27B0', time: '15:00' },
    { date: '2026-03-07', title: 'Sprint Review', color: '#2196F3', time: '11:00' },
    { date: '2026-03-10', title: '월간 전체회의', color: '#00BCD4', time: '10:00' },
    { date: '2026-03-12', title: '디자인 리뷰', color: '#E91E63', time: '14:00' },
    { date: '2026-03-14', title: '분기 보고', color: '#FF9800', time: '16:00' },
    { date: '2026-03-17', title: '개발팀 회식', color: '#4CAF50', time: '18:30' },
    { date: '2026-03-20', title: '외부 세미나', color: '#607D8B', time: '09:00' },
    { date: '2026-03-21', title: '코드리뷰 데이', color: '#2196F3', time: '13:00' },
    { date: '2026-03-25', title: '스프린트 플래닝', color: '#2196F3', time: '10:00' },
    { date: '2026-03-28', title: 'Sprint 종료', color: '#FF9800', time: '17:00' },
];

/* ─── 유틸 ─── */
const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const hours = Array.from({ length: 24 }, (_, i) => i);

/* ─── 이벤트 칩 ─── */
const EventChip: React.FC<{ ev: CalEvent; compact?: boolean }> = ({ ev, compact }) => (
    <div style={{
        fontSize: compact ? 10 : 11,
        padding: compact ? '0 3px' : '1px 4px',
        marginBottom: 2,
        borderRadius: 3,
        background: `${ev.color}18`,
        borderLeft: `3px solid ${ev.color}`,
        color: ev.color,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: 500,
    }}>
        {ev.time && <span style={{ marginRight: 3 }}>{ev.time}</span>}
        {ev.title}
    </div>
);

const CalendarPage: React.FC = () => {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(3);
    const [selectedDay, setSelectedDay] = useState(6);
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');

    const handlePrev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
    const handleNext = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };
    const handleToday = () => { const n = new Date(); setYear(n.getFullYear()); setMonth(n.getMonth() + 1); setSelectedDay(n.getDate()); };

    const today = new Date();
    const isToday = (d: number) => year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate();

    const getEvents = (day: number, m?: number) => {
        const mo = m ?? month;
        const dateStr = `${year}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dummyEvents.filter(e => e.date === dateStr);
    };

    const monthEvents = dummyEvents
        .filter(e => e.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
        .sort((a, b) => a.date.localeCompare(b.date));

    const viewModes: { key: typeof viewMode; label: string }[] = [
        { key: 'day', label: '일간' },
        { key: 'week', label: '주간' },
        { key: 'month', label: '월간' },
        { key: 'year', label: '연간' },
    ];

    /* ─── 헤더 타이틀 ─── */
    const headerTitle = () => {
        if (viewMode === 'day') return `${year}년 ${month}월 ${selectedDay}일`;
        if (viewMode === 'year') return `${year}년`;
        return `${year}년 ${month}월`;
    };

    /* ─── 월간 뷰 ─── */
    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfWeek(year, month);
        const prevMonthDays = getDaysInMonth(year, month === 1 ? 12 : month - 1);

        const cells: { day: number; currentMonth: boolean }[] = [];
        for (let i = 0; i < firstDay; i++) cells.push({ day: prevMonthDays - firstDay + 1 + i, currentMonth: false });
        for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
        const remaining = 42 - cells.length;
        for (let i = 1; i <= remaining; i++) cells.push({ day: i, currentMonth: false });

        return (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#FAFAFA', borderBottom: '1px solid var(--border)' }}>
                    {dayNames.map((d, i) => (
                        <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: 600, color: i === 0 ? '#FF4D4F' : i === 6 ? '#1890FF' : '#666' }}>
                            {d}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {cells.map((cell, idx) => {
                        const colIdx = idx % 7;
                        const events = cell.currentMonth ? getEvents(cell.day) : [];
                        const todayCell = cell.currentMonth && isToday(cell.day);
                        return (
                            <div key={idx} style={{
                                minHeight: 100, padding: '6px 8px',
                                borderRight: colIdx < 6 ? '1px solid #f0f0f0' : 'none',
                                borderBottom: idx < 35 ? '1px solid #f0f0f0' : 'none',
                                background: todayCell ? '#F0FAF8' : cell.currentMonth ? '#fff' : '#FAFAFA',
                                cursor: 'pointer', transition: 'background 0.12s',
                            }}
                                onClick={() => { if (cell.currentMonth) { setSelectedDay(cell.day); setViewMode('day'); } }}
                                onMouseEnter={e => { if (!todayCell) e.currentTarget.style.background = '#f8f8f8'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = todayCell ? '#F0FAF8' : cell.currentMonth ? '#fff' : '#FAFAFA'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 13, fontWeight: todayCell ? 700 : 400,
                                        color: !cell.currentMonth ? '#ccc' : todayCell ? '#fff' : colIdx === 0 ? '#FF4D4F' : colIdx === 6 ? '#1890FF' : 'var(--text-primary)',
                                        ...(todayCell ? { background: 'var(--primary)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
                                    }}>
                                        {cell.day}
                                    </span>
                                </div>
                                {events.slice(0, 3).map((ev, i) => <EventChip key={i} ev={ev} />)}
                                {events.length > 3 && <Badge count={`+${events.length - 3}`} size="small" style={{ background: '#999', fontSize: 10 }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ─── 일간 뷰 ─── */
    const renderDayView = () => {
        const dayEvents = getEvents(selectedDay);
        return (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: '#FAFAFA', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                    {month}월 {selectedDay}일 ({dayNames[new Date(year, month - 1, selectedDay).getDay()]})
                    {isToday(selectedDay) && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>오늘</span>}
                </div>
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                    {hours.map(h => {
                        const hourEvents = dayEvents.filter(ev => ev.time && parseInt(ev.time.split(':')[0]) === h);
                        return (
                            <div key={h} style={{
                                display: 'flex', minHeight: 48,
                                borderBottom: '1px solid #f0f0f0',
                            }}>
                                <div style={{
                                    width: 60, flexShrink: 0, padding: '4px 8px',
                                    fontSize: 12, color: '#999', textAlign: 'right',
                                    borderRight: '1px solid #f0f0f0',
                                }}>
                                    {String(h).padStart(2, '0')}:00
                                </div>
                                <div style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {hourEvents.map((ev, i) => <EventChip key={i} ev={ev} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ─── 주간 뷰 ─── */
    const renderWeekView = () => {
        const currentDate = new Date(year, month - 1, selectedDay);
        const dayOfWeek = currentDate.getDay();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - dayOfWeek);

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
        });

        return (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {/* 요일 헤더 */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', background: '#FAFAFA', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ borderRight: '1px solid var(--border)' }} />
                    {weekDays.map((d, i) => {
                        const isTodayCol = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
                        return (
                            <div key={i} style={{
                                textAlign: 'center', padding: '8px 0',
                                borderRight: i < 6 ? '1px solid #f0f0f0' : 'none',
                            }}>
                                <div style={{ fontSize: 11, color: i === 0 ? '#FF4D4F' : i === 6 ? '#1890FF' : '#999' }}>
                                    {dayNames[i]}
                                </div>
                                <div style={{
                                    fontSize: 16, fontWeight: isTodayCol ? 700 : 500,
                                    color: isTodayCol ? 'var(--primary)' : 'var(--text-primary)',
                                }}>
                                    {d.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* 시간 그리드 */}
                <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                    {hours.filter(h => h >= 7 && h <= 21).map(h => (
                        <div key={h} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: 48, borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ padding: '4px 8px', fontSize: 12, color: '#999', textAlign: 'right', borderRight: '1px solid #f0f0f0' }}>
                                {String(h).padStart(2, '0')}:00
                            </div>
                            {weekDays.map((d, i) => {
                                const evts = dummyEvents.filter(ev => {
                                    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                    return ev.date === ds && ev.time && parseInt(ev.time.split(':')[0]) === h;
                                });
                                return (
                                    <div key={i} style={{ padding: '2px 4px', borderRight: i < 6 ? '1px solid #f0f0f0' : 'none' }}>
                                        {evts.map((ev, ei) => <EventChip key={ei} ev={ev} compact />)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    /* ─── 연간 뷰 ─── */
    const renderYearView = () => {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {months.map(m => {
                    const daysIn = getDaysInMonth(year, m);
                    const first = getFirstDayOfWeek(year, m);
                    const miniCells: (number | null)[] = Array(first).fill(null);
                    for (let d = 1; d <= daysIn; d++) miniCells.push(d);

                    const isCurrentMonth = year === today.getFullYear() && m === today.getMonth() + 1;

                    return (
                        <div
                            key={m}
                            style={{
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: 12,
                                cursor: 'pointer',
                                background: isCurrentMonth ? '#F0FAF8' : '#fff',
                                transition: 'box-shadow 0.15s',
                            }}
                            onClick={() => { setMonth(m); setViewMode('month'); }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div style={{
                                fontSize: 14, fontWeight: 600, marginBottom: 8, textAlign: 'center',
                                color: isCurrentMonth ? 'var(--primary)' : 'var(--text-primary)',
                            }}>
                                {m}월
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                                {dayNames.map((dn, i) => (
                                    <div key={dn} style={{ textAlign: 'center', fontSize: 9, color: i === 0 ? '#FF4D4F' : i === 6 ? '#1890FF' : '#bbb', fontWeight: 600, marginBottom: 2 }}>
                                        {dn}
                                    </div>
                                ))}
                                {miniCells.map((d, idx) => {
                                    const isTd = d !== null && year === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate();
                                    const hasEvents = d !== null && getEvents(d, m).length > 0;
                                    return (
                                        <div key={idx} style={{ textAlign: 'center', fontSize: 10, padding: '2px 0', position: 'relative' }}>
                                            <span style={{
                                                color: d === null ? 'transparent' : isTd ? '#fff' : '#666',
                                                fontWeight: isTd ? 700 : 400,
                                                ...(isTd ? { background: 'var(--primary)', borderRadius: '50%', padding: '1px 3px' } : {}),
                                            }}>
                                                {d ?? '.'}
                                            </span>
                                            {hasEvents && <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--primary)', margin: '0 auto' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            {/* 상단 헤더 — 3단 flex */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                marginBottom: 20,
            }}>
                {/* 좌: 보기 모드 */}
                <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}>
                    {viewModes.map(vm => (
                        <div
                            key={vm.key}
                            onClick={() => setViewMode(vm.key)}
                            style={{
                                padding: '6px 14px',
                                fontSize: 13,
                                fontWeight: viewMode === vm.key ? 600 : 400,
                                color: viewMode === vm.key ? '#fff' : 'var(--text-secondary)',
                                background: viewMode === vm.key ? 'var(--primary)' : '#fff',
                                cursor: 'pointer',
                                borderRight: vm.key !== 'year' ? '1px solid var(--border)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            {vm.label}
                        </div>
                    ))}
                </div>

                {/* 중앙: 네비게이션 (정확한 가운데) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <LeftOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer' }} onClick={handlePrev} />
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', minWidth: 150, textAlign: 'center' }}>
                        {headerTitle()}
                    </span>
                    <RightOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer' }} onClick={handleNext} />
                    <Button size="small" onClick={handleToday}>오늘</Button>
                </div>

                {/* 우: 일정목록 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        icon={<UnorderedListOutlined />}
                        type={showList ? 'primary' : 'default'}
                        onClick={() => setShowList(!showList)}
                    >
                        일정목록
                    </Button>
                </div>
            </div>

            {/* 일정 목록 토글 */}
            {showList && (
                <div style={{
                    background: '#FAFAFA', border: '1px solid var(--border)', borderRadius: 8,
                    padding: 16, marginBottom: 20, maxHeight: 240, overflowY: 'auto',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                        이번 달 일정 ({monthEvents.length}건)
                    </div>
                    {monthEvents.map((ev, idx) => (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                            borderBottom: idx < monthEvents.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{ev.date.slice(5)}</span>
                            <span style={{ fontSize: 12, color: '#999', width: 45, flexShrink: 0 }}>{ev.time}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{ev.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 뷰 렌더링 */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'year' && renderYearView()}
        </div>
    );
};

export default CalendarPage;
