import React, { useState } from 'react';
import { Table, Button, Input, Select, Tag } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    PaperClipOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

/* ─── 더미 데이터 ─── */
const allDocuments = [
    { key: '1', formType: '지출결의서', title: '3월 프로젝트 경비 정산', hasAttachment: true, drafter: '김철수', department: '개발팀', docNumber: 'DOC-2026-0312', approvalDate: '2026-03-05' },
    { key: '2', formType: '휴가신청서', title: '연차 휴가 신청 (3/10~3/11)', hasAttachment: false, drafter: '이영희', department: 'IT서비스', docNumber: 'DOC-2026-0311', approvalDate: '2026-03-05' },
    { key: '3', formType: '구매요청서', title: '개발 장비 구매 요청 (노트북 3대)', hasAttachment: true, drafter: '박민수', department: '총무팀', docNumber: 'DOC-2026-0310', approvalDate: '2026-03-04' },
    { key: '4', formType: '품의서', title: '프로젝트 예산 변경 요청', hasAttachment: true, drafter: '최지연', department: '기획팀', docNumber: 'DOC-2026-0309', approvalDate: '2026-03-04' },
    { key: '5', formType: '출장신청서', title: '고객사 미팅 출장 신청 (부산)', hasAttachment: false, drafter: '홍길동', department: '개발팀', docNumber: 'DOC-2026-0308', approvalDate: '2026-03-03' },
    { key: '6', formType: '지출결의서', title: '외부 교육 참가비 결제', hasAttachment: false, drafter: '강서연', department: 'IT서비스', docNumber: 'DOC-2026-0307', approvalDate: '2026-03-03' },
    { key: '7', formType: '업무보고', title: '2월 월간 업무 보고', hasAttachment: true, drafter: '정호진', department: '재무팀', docNumber: 'DOC-2026-0306', approvalDate: '2026-03-02' },
    { key: '8', formType: '구매요청서', title: '사무용품 구매 요청서', hasAttachment: false, drafter: '김철수', department: '개발팀', docNumber: 'DOC-2026-0305', approvalDate: '2026-03-02' },
    { key: '9', formType: '협조전', title: 'IT 인프라 점검 협조 요청', hasAttachment: true, drafter: '박민수', department: '인프라팀', docNumber: 'DOC-2026-0304', approvalDate: '2026-03-01' },
    { key: '10', formType: '품의서', title: '서버 증설 비용 결재 요청', hasAttachment: true, drafter: '김철수', department: '개발팀', docNumber: 'DOC-2026-0303', approvalDate: '2026-03-01' },
    { key: '11', formType: '휴가신청서', title: '경조사 휴가 신청', hasAttachment: false, drafter: '최지연', department: '기획팀', docNumber: 'DOC-2026-0302', approvalDate: '2026-02-28' },
    { key: '12', formType: '지출결의서', title: '법인카드 사용 내역 정산', hasAttachment: false, drafter: '정호진', department: '재무팀', docNumber: 'DOC-2026-0301', approvalDate: '2026-02-28' },
    { key: '13', formType: '업무보고', title: '1분기 프로젝트 진행 현황 보고', hasAttachment: true, drafter: '홍길동', department: '개발팀', docNumber: 'DOC-2026-0300', approvalDate: '2026-02-27' },
    { key: '14', formType: '출장신청서', title: '해외 세미나 참석 출장 신청', hasAttachment: true, drafter: '강서연', department: 'IT서비스', docNumber: 'DOC-2026-0299', approvalDate: '2026-02-26' },
    { key: '15', formType: '협조전', title: '보안 정책 변경 협조 안내', hasAttachment: false, drafter: '보안팀', department: '보안팀', docNumber: 'DOC-2026-0298', approvalDate: '2026-02-25' },
];

const formTypeColorMap: Record<string, { bg: string; color: string }> = {
    '지출결의서': { bg: '#E6F7FF', color: '#1677FF' },
    '휴가신청서': { bg: '#FFF7E6', color: '#D48806' },
    '구매요청서': { bg: '#F0FAF8', color: '#00897B' },
    '품의서': { bg: '#F9F0FF', color: '#722ED1' },
    '출장신청서': { bg: '#FFF1F0', color: '#FF4D4F' },
    '업무보고': { bg: '#F0F5FF', color: '#2F54EB' },
    '협조전': { bg: '#F6FFED', color: '#52C41A' },
};

const AllDocsPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [formFilter, setFormFilter] = useState<string>('all');

    const filteredDocs = allDocuments.filter(doc => {
        const matchesSearch = searchText === '' ||
            doc.title.includes(searchText) ||
            doc.drafter.includes(searchText) ||
            doc.docNumber.includes(searchText);
        const matchesForm = formFilter === 'all' || doc.formType === formFilter;
        return matchesSearch && matchesForm;
    });

    const columns = [
        {
            title: '결재양식',
            dataIndex: 'formType',
            key: 'formType',
            width: 110,
            render: (text: string) => {
                const style = formTypeColorMap[text] || { bg: '#F5F5F5', color: '#666' };
                return (
                    <Tag style={{ background: style.bg, color: style.color, border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                        {text}
                    </Tag>
                );
            },
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
            title: '첨부',
            dataIndex: 'hasAttachment',
            key: 'hasAttachment',
            width: 50,
            align: 'center' as const,
            render: (has: boolean) =>
                has ? <PaperClipOutlined style={{ color: '#999', fontSize: 14 }} /> : null,
        },
        {
            title: '기안자',
            dataIndex: 'drafter',
            key: 'drafter',
            width: 100,
            render: (text: string, record: typeof allDocuments[0]) => (
                <div>
                    <div style={{ fontSize: 13 }}>{text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.department}</div>
                </div>
            ),
        },
        {
            title: '문서번호',
            dataIndex: 'docNumber',
            key: 'docNumber',
            width: 140,
            render: (text: string) => (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{text}</span>
            ),
        },
        {
            title: '결재일',
            dataIndex: 'approvalDate',
            key: 'approvalDate',
            width: 110,
            render: (text: string) => (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>
            ),
        },
    ];

    const uniqueForms = Array.from(new Set(allDocuments.map(d => d.formType)));

    return (
        <div>
            {/* 헤더 */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: 'var(--primary)' }} />
                전사 문서함
            </h2>

            {/* 필터 & 검색 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Select
                    value={formFilter}
                    onChange={setFormFilter}
                    size="small"
                    style={{ width: 130 }}
                    options={[
                        { value: 'all', label: '전체 양식' },
                        ...uniqueForms.map(f => ({ value: f, label: f })),
                    ]}
                />
                <Input
                    placeholder="제목, 기안자, 문서번호 검색"
                    size="small"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 240 }}
                    suffix={<SearchOutlined style={{ color: '#999' }} />}
                />
                <Button size="small" icon={<ReloadOutlined />}>새로고침</Button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    전체 {filteredDocs.length}건
                </span>
            </div>

            {/* 문서 목록 테이블 */}
            <Table
                columns={columns}
                dataSource={filteredDocs}
                size="small"
                pagination={{ pageSize: 15, showSizeChanger: false, position: ['bottomCenter'] }}
                onRow={() => ({
                    style: { height: 44, cursor: 'pointer' },
                })}
            />
        </div>
    );
};

export default AllDocsPage;
