import React from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';

const categoryNameMap: Record<string, string> = {
    recent: '최근 열람 문서',
    updated: '최근 업데이트 문서',
    'pending-approval': '승인 대기 문서',
    'pending-register': '등록 대기 문서',
};

type DocItem = {
    key: string;
    lastViewed: string;
    registeredDate: string;
    title: string;
    docNumber: string;
    hasAttachment: boolean;
    location: string;
    registrant: string;
};

const recentDocs: DocItem[] = [
    { key: '1', lastViewed: '2026-03-06 09:10', registeredDate: '2026-02-20', title: '2026년 상반기 사업 계획서', docNumber: 'DM-2026-0045', hasAttachment: true, location: '기획팀 > 사업계획', registrant: '홍길동' },
    { key: '2', lastViewed: '2026-03-05 16:30', registeredDate: '2026-03-01', title: '3월 법인카드 사용 내역', docNumber: 'DM-2026-0044', hasAttachment: false, location: '재무팀 > 경비', registrant: '정호진' },
    { key: '3', lastViewed: '2026-03-05 14:20', registeredDate: '2026-02-28', title: '신규 서비스 기획안 v2', docNumber: 'DM-2026-0043', hasAttachment: true, location: 'IT서비스 > 기획', registrant: '강서연' },
    { key: '4', lastViewed: '2026-03-04 11:00', registeredDate: '2026-01-15', title: 'API 연동 가이드 문서', docNumber: 'DM-2026-0020', hasAttachment: true, location: '개발팀 > 기술문서', registrant: '김철수' },
];

const updatedDocs: DocItem[] = [
    { key: '1', lastViewed: '2026-03-06 08:45', registeredDate: '2026-03-06', title: 'API 연동 가이드 문서 (수정)', docNumber: 'DM-2026-0020', hasAttachment: true, location: '개발팀 > 기술문서', registrant: '김철수' },
    { key: '2', lastViewed: '2026-03-05 17:00', registeredDate: '2026-03-05', title: '보안 정책 가이드라인 v3.1', docNumber: 'DM-2026-0038', hasAttachment: true, location: '보안팀 > 정책', registrant: '보안팀' },
    { key: '3', lastViewed: '2026-03-04 10:15', registeredDate: '2026-03-04', title: '2026년 교육 일정표', docNumber: 'DM-2026-0041', hasAttachment: false, location: '인사팀 > 교육', registrant: '인사팀' },
];

const pendingApprovalDocs: DocItem[] = [
    { key: '1', lastViewed: '-', registeredDate: '2026-03-05', title: '서버 증설 비용 결재 요청', docNumber: 'DM-2026-0046', hasAttachment: true, location: '인프라팀 > 인프라', registrant: '박민수' },
    { key: '2', lastViewed: '-', registeredDate: '2026-03-05', title: '외부 교육 참가 신청', docNumber: 'DM-2026-0047', hasAttachment: false, location: '기획팀 > 교육', registrant: '최지연' },
];

const pendingRegisterDocs: DocItem[] = [
    { key: '1', lastViewed: '-', registeredDate: '2026-03-06', title: '프로젝트 완료 보고서 (초안)', docNumber: 'DM-2026-0048', hasAttachment: true, location: '개발팀 > 보고서', registrant: '홍길동' },
    { key: '2', lastViewed: '-', registeredDate: '2026-03-05', title: '회의록 - 3월 정기 회의', docNumber: 'DM-2026-0049', hasAttachment: false, location: 'IT서비스 > 회의록', registrant: '이영희' },
    { key: '3', lastViewed: '-', registeredDate: '2026-03-04', title: '장비 반납 확인서', docNumber: 'DM-2026-0050', hasAttachment: false, location: '총무팀 > 자산관리', registrant: '강서연' },
];

function getDocsForCategory(category: string): DocItem[] {
    switch (category) {
        case 'recent': return recentDocs;
        case 'updated': return updatedDocs;
        case 'pending-approval': return pendingApprovalDocs;
        case 'pending-register': return pendingRegisterDocs;
        default: return recentDocs;
    }
}

const DocMgrPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const currentCategory = category || 'recent';
    const categoryName = categoryNameMap[currentCategory] || '최근 열람 문서';
    const docs = getDocsForCategory(currentCategory);

    const columns = [
        {
            title: '최근 열람일',
            dataIndex: 'lastViewed',
            key: 'lastViewed',
            width: 140,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '등록일',
            dataIndex: 'registeredDate',
            key: 'registeredDate',
            width: 110,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string) => (
                <span style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>{text}</span>
            ),
        },
        {
            title: '문서번호',
            dataIndex: 'docNumber',
            key: 'docNumber',
            width: 130,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{text}</span>,
        },
        {
            title: '첨부',
            dataIndex: 'hasAttachment',
            key: 'hasAttachment',
            width: 50,
            align: 'center' as const,
            render: (has: boolean) =>
                has ? <PaperClipOutlined style={{ color: '#999', fontSize: 14 }} /> : null,
        },
        {
            title: '위치',
            dataIndex: 'location',
            key: 'location',
            width: 150,
            ellipsis: true,
            render: (text: string) => <span style={{ fontSize: 12, color: '#888' }}>{text}</span>,
        },
        {
            title: '등록자',
            dataIndex: 'registrant',
            key: 'registrant',
            width: 80,
            render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>,
        },
    ];

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                {categoryName}
            </h2>

            <Table
                columns={columns}
                dataSource={docs}
                size="small"
                pagination={false}
                locale={{ emptyText: '문서가 없습니다' }}
                onRow={() => ({
                    style: { height: 44, cursor: 'pointer' },
                })}
            />
        </div>
    );
};

export default DocMgrPage;
