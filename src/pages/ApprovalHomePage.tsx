import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const dummyData = [
    { key: '1', id: 'AP-2026-001', title: '출장 경비 신청', author: '김철수', status: '진행', date: '2026-03-05', dept: '개발팀' },
    { key: '2', id: 'AP-2026-002', title: '연차 휴가 신청', author: '이영희', status: '완료', date: '2026-03-04', dept: 'IT서비스' },
    { key: '3', id: 'AP-2026-003', title: '물품 구매 요청서', author: '박민수', status: '진행', date: '2026-03-04', dept: '총무팀' },
    { key: '4', id: 'AP-2026-004', title: '프로젝트 예산 변경 요청', author: '최지연', status: '반려', date: '2026-03-03', dept: '기획팀' },
    { key: '5', id: 'AP-2026-005', title: '재택근무 신청', author: '홍길동', status: '임시저장', date: '2026-03-03', dept: '개발팀' },
    { key: '6', id: 'AP-2026-006', title: '외부 교육 신청', author: '강서연', status: '진행', date: '2026-03-02', dept: 'IT서비스' },
    { key: '7', id: 'AP-2026-007', title: '법인카드 사용 승인', author: '정호진', status: '완료', date: '2026-03-01', dept: '재무팀' },
    { key: '8', id: 'AP-2026-008', title: '서버 증설 요청', author: '김철수', status: '진행', date: '2026-02-28', dept: '개발팀' },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
    '진행': { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' },
    '완료': { bg: 'var(--status-done-bg)', text: 'var(--status-done-text)' },
    '반려': { bg: 'var(--status-reject-bg)', text: 'var(--status-reject-text)' },
    '임시저장': { bg: 'var(--status-draft-bg)', text: 'var(--status-draft-text)' },
};

const ApprovalHomePage: React.FC = () => {
    const navigate = useNavigate();

    const columns = [
        {
            title: '문서번호',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            render: (text: string, record: typeof dummyData[0]) => (
                <a onClick={() => navigate(`/approval/${record.key}`)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                    {text}
                </a>
            ),
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: '기안자',
            dataIndex: 'author',
            key: 'author',
            width: 100,
        },
        {
            title: '부서',
            dataIndex: 'dept',
            key: 'dept',
            width: 100,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status: string) => {
                const cfg = statusConfig[status] || { bg: '#f0f0f0', text: '#555' };
                return (
                    <Tag
                        style={{
                            background: cfg.bg,
                            color: cfg.text,
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 12,
                        }}
                    >
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: '기안일',
            dataIndex: 'date',
            key: 'date',
            width: 110,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    결재 대기 문서
                </h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/approval/new')}>
                    새 결재 작성
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={dummyData}
                size="small"
                pagination={{ pageSize: 10, showSizeChanger: false, position: ['bottomCenter'] }}
                style={{ borderRadius: 6, overflow: 'hidden' }}
                onRow={(record) => ({
                    style: { height: 40, cursor: 'pointer' },
                    onClick: () => navigate(`/approval/${record.key}`),
                })}
            />
        </div>
    );
};

export default ApprovalHomePage;
