import React, { useState } from 'react';
import { Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

/* ─── 자산 데이터 ─── */
type AssetCategory = {
    key: string;
    label: string;
    assets: { name: string; key: string }[];
};

const assetCategories: Record<string, AssetCategory> = {
    room: {
        key: 'room',
        label: '회의실',
        assets: [
            { name: '9F-VIP회의실', key: 'vip' },
            { name: '9F-회의실(12명)', key: '9f-12' },
            { name: '10F-회의실1(4명)', key: '10f-1' },
            { name: '10F-회의실3(8명)', key: '10f-3' },
            { name: '10F-회의실4(8명)', key: '10f-4' },
            { name: '10F-회의실5(8명)', key: '10f-5' },
            { name: '민성 회의실', key: 'ms' },
        ],
    },
    video: {
        key: 'video',
        label: '화상회의 장비',
        assets: [
            { name: '화상장비 A', key: 'v-a' },
            { name: '화상장비 B', key: 'v-b' },
            { name: '노트북(프레젠테이션)', key: 'v-nb' },
        ],
    },
    exhibition: {
        key: 'exhibition',
        label: '전시장',
        assets: [
            { name: '1F 전시홀', key: 'ex-1' },
            { name: '2F 갤러리', key: 'ex-2' },
        ],
    },
    vehicle: {
        key: 'vehicle',
        label: '차량',
        assets: [
            { name: '업무용 차량 1', key: 'car-1' },
            { name: '업무용 차량 2', key: 'car-2' },
            { name: '법인 차량', key: 'car-corp' },
        ],
    },
};

/* ─── 더미 예약 데이터 ─── */
type Reservation = {
    assetKey: string;
    date: string;
    startHour: number;
    endHour: number;
    title: string;
    color: string;
    person: string;
};

const dummyReservations: Reservation[] = [
    { assetKey: 'vip', date: '2026-03-06', startHour: 9, endHour: 11, title: '경영회의', color: '#1890FF', person: '김대표' },
    { assetKey: '9f-12', date: '2026-03-06', startHour: 14, endHour: 16, title: '디자인 리뷰', color: '#E91E63', person: '이영희' },
    { assetKey: '10f-1', date: '2026-03-06', startHour: 10, endHour: 11, title: '1:1 면담', color: '#9C27B0', person: '박민수' },
    { assetKey: '10f-3', date: '2026-03-06', startHour: 13, endHour: 14, title: '스프린트 플래닝', color: '#FF9800', person: '최동욱' },
    { assetKey: 'ms', date: '2026-03-06', startHour: 15, endHour: 17, title: '고객 미팅', color: '#4CAF50', person: '정수진' },
    { assetKey: 'v-a', date: '2026-03-06', startHour: 10, endHour: 12, title: '본사 화상회의', color: '#1890FF', person: '김철수' },
    { assetKey: 'car-1', date: '2026-03-06', startHour: 9, endHour: 13, title: '클라이언트 방문', color: '#FF9800', person: '박지훈' },
];

const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6); // 06 ~ 20

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

const ReservePage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const categoryKey = type || 'room';
    const category = assetCategories[categoryKey] || assetCategories.room;

    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(3);
    const [day, setDay] = useState(6);

    const dateObj = new Date(year, month - 1, day);
    const dayName = dayNames[dateObj.getDay()];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const handlePrev = () => {
        const d = new Date(year, month - 1, day - 1);
        setYear(d.getFullYear()); setMonth(d.getMonth() + 1); setDay(d.getDate());
    };
    const handleNext = () => {
        const d = new Date(year, month - 1, day + 1);
        setYear(d.getFullYear()); setMonth(d.getMonth() + 1); setDay(d.getDate());
    };
    const handleToday = () => {
        const n = new Date();
        setYear(n.getFullYear()); setMonth(n.getMonth() + 1); setDay(n.getDate());
    };

    const dayReservations = dummyReservations.filter(r => r.date === dateStr);

    /* 내 예약 테이블 */
    const myReservations = dummyReservations.filter(r => r.date === dateStr && r.person === '김철수');
    const myReservationColumns = [
        { title: '자산', dataIndex: 'assetName', key: 'assetName', width: 200 },
        { title: '이름', dataIndex: 'person', key: 'person', width: 150 },
        { title: '예약 종류', dataIndex: 'title', key: 'title', width: 200 },
        {
            title: '예약 시간 (대여 시작 시간)',
            dataIndex: 'time',
            key: 'time',
        },
    ];
    const myReservationData = myReservations.map(r => {
        const asset = Object.values(assetCategories).flatMap(c => c.assets).find(a => a.key === r.assetKey);
        return {
            key: r.assetKey + r.startHour,
            assetName: asset?.name || r.assetKey,
            person: r.person,
            title: r.title,
            time: `${String(r.startHour).padStart(2, '0')}:00 ~ ${String(r.endHour).padStart(2, '0')}:00`,
        };
    });

    return (
        <div>
            {/* 헤더 */}
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>
                자산 예약 현황
            </h2>

            {/* 날짜 네비게이션 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                <LeftOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer' }} onClick={handlePrev} />
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dateStr} ({dayName})
                </span>
                <RightOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer' }} onClick={handleNext} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 4 }} onClick={handleToday}>
                    오늘
                </span>
            </div>

            {/* 시간 그리드 */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
                {/* 시간 헤더 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `180px repeat(${timeSlots.length}, 1fr)`,
                    background: '#FAFAFA',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{ borderRight: '1px solid var(--border)', padding: '8px 12px', fontSize: 12, color: '#999' }} />
                    {timeSlots.map(h => (
                        <div key={h} style={{
                            textAlign: 'center', padding: '8px 0', fontSize: 12, fontWeight: 500, color: '#666',
                            borderRight: '1px solid #f0f0f0',
                        }}>
                            {String(h).padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* 자산 행 */}
                {category.assets.map(asset => {
                    const assetRes = dayReservations.filter(r => r.assetKey === asset.key);
                    return (
                        <div key={asset.key} style={{
                            display: 'grid',
                            gridTemplateColumns: `180px repeat(${timeSlots.length}, 1fr)`,
                            borderBottom: '1px solid #f0f0f0',
                            minHeight: 36,
                        }}>
                            <div style={{
                                padding: '6px 12px', fontSize: 13, color: 'var(--primary)',
                                borderRight: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center',
                                fontWeight: 500, cursor: 'pointer',
                            }}>
                                {asset.name}
                            </div>
                            {timeSlots.map(h => {
                                const res = assetRes.find(r => h >= r.startHour && h < r.endHour);
                                const isStart = res && h === res.startHour;
                                return (
                                    <div key={h} style={{
                                        borderRight: '1px solid #f0f0f0',
                                        position: 'relative',
                                        background: res ? `${res.color}15` : 'transparent',
                                    }}>
                                        {isStart && (
                                            <div style={{
                                                position: 'absolute',
                                                left: 0, top: 2, bottom: 2,
                                                width: `${(res.endHour - res.startHour) * 100}%`,
                                                background: `${res.color}25`,
                                                borderLeft: `3px solid ${res.color}`,
                                                borderRadius: 3,
                                                padding: '2px 6px',
                                                fontSize: 10,
                                                color: res.color,
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                                zIndex: 1,
                                            }}>
                                                {res.title}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* 내 예약/대여 현황 */}
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                내 예약/대여 현황
            </h3>
            <Table
                columns={myReservationColumns}
                dataSource={myReservationData}
                size="middle"
                pagination={false}
                locale={{ emptyText: <span style={{ color: 'var(--primary)', padding: 24, display: 'block' }}>예약/대여 중인 항목이 없습니다.</span> }}
                style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}
            />
        </div>
    );
};

export default ReservePage;
