import React from 'react';
import { Table } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

type ReportItem = {
    key: string;
    reportDate: string;
    department: string;
    reportType: string;
    title: string;
    reporter: string;
};

const recentReports: ReportItem[] = [
    { key: '1', reportDate: '2026-03-06', department: '개발팀', reportType: '주간보고', title: '3월 1주차 개발팀 주간 업무 보고', reporter: '김철수' },
    { key: '2', reportDate: '2026-03-06', department: 'IT서비스', reportType: '주간보고', title: 'IT서비스 운영 현황 보고', reporter: '강서연' },
    { key: '3', reportDate: '2026-03-05', department: '기획팀', reportType: '월간보고', title: '2월 기획팀 월간 실적 보고', reporter: '최지연' },
    { key: '4', reportDate: '2026-03-05', department: '인프라팀', reportType: '장애보고', title: '서버 장애 발생 및 조치 보고', reporter: '박민수' },
    { key: '5', reportDate: '2026-03-04', department: '재무팀', reportType: '월간보고', title: '2월 재무 결산 보고', reporter: '정호진' },
    { key: '6', reportDate: '2026-03-04', department: '마케팅팀', reportType: '주간보고', title: '마케팅 캠페인 성과 보고', reporter: '이수진' },
    { key: '7', reportDate: '2026-03-03', department: '개발팀', reportType: '프로젝트보고', title: '그룹웨어 리뉴얼 프로젝트 진행 보고', reporter: '홍길동' },
    { key: '8', reportDate: '2026-03-03', department: '인사팀', reportType: '월간보고', title: '2월 인사 현황 보고', reporter: '한미영' },
    { key: '9', reportDate: '2026-03-02', department: '보안팀', reportType: '점검보고', title: '3월 보안 점검 결과 보고', reporter: '보안팀' },
    { key: '10', reportDate: '2026-03-01', department: '총무팀', reportType: '주간보고', title: '사무실 환경 개선 업무 보고', reporter: '김영수' },
];

const ReportPage: React.FC = () => {
    const columns = [
        {
            title: '보고일',
            dataIndex: 'reportDate',
            key: 'reportDate',
            width: 110,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '부서',
            dataIndex: 'department',
            key: 'department',
            width: 100,
            render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>,
        },
        {
            title: '보고서',
            dataIndex: 'reportType',
            key: 'reportType',
            width: 110,
            render: (text: string) => <span style={{ fontSize: 12, color: '#666' }}>{text}</span>,
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string) => <span style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>{text}</span>,
        },
        {
            title: '보고자',
            dataIndex: 'reporter',
            key: 'reporter',
            width: 90,
            render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>,
        },
    ];

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: 'var(--primary)' }} />
                보고 홈
            </h2>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                최근 생성된 보고서
            </h3>

            <Table
                columns={columns}
                dataSource={recentReports}
                size="small"
                pagination={{ pageSize: 15, showSizeChanger: false, position: ['bottomCenter'] }}
                onRow={() => ({ style: { height: 42, cursor: 'pointer' } })}
            />
        </div>
    );
};

export default ReportPage;
