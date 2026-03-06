import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Space } from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    UploadOutlined,
    FolderAddOutlined,
} from '@ant-design/icons';
import { companyFolders, personalFolders, type DriveFolder } from '../data/driveFolders';

const typeNameMap: Record<string, string> = {
    company: '전사 자료실',
    personal: '개인 자료실',
};

/* ─── 폴더 내부 더미 파일 ─── */
type FileItem = {
    key: string;
    name: string;
    type: 'folder' | 'file';
    size: string;
    modified: string;
    owner: string;
};

const folderFilesMap: Record<string, FileItem[]> = {
    c1: [
        { key: 'f1', name: '공지사항_2026.docx', type: 'file', size: '120 KB', modified: '2026-03-05', owner: '관리자' },
        { key: 'f2', name: '회사 소개 자료.pptx', type: 'file', size: '8.4 MB', modified: '2026-03-01', owner: '마케팅팀' },
        { key: 'f3', name: '사내 규정집.pdf', type: 'file', size: '3.1 MB', modified: '2026-02-28', owner: '인사팀' },
    ],
    c2: [
        { key: 'f1', name: '개발팀 회의록', type: 'folder', size: '-', modified: '2026-03-04', owner: '김철수' },
        { key: 'f2', name: '기획팀 보고서', type: 'folder', size: '-', modified: '2026-03-02', owner: '최지연' },
    ],
    c3: [
        { key: 'f1', name: 'React 교육 자료.pdf', type: 'file', size: '5.2 MB', modified: '2026-02-20', owner: '개발팀' },
        { key: 'f2', name: '보안 교육 영상 링크.txt', type: 'file', size: '1 KB', modified: '2026-02-10', owner: '보안팀' },
    ],
    c4: [
        { key: 'f1', name: '지출결의서 양식.xlsx', type: 'file', size: '45 KB', modified: '2026-01-15', owner: '관리자' },
        { key: 'f2', name: '휴가신청서 양식.docx', type: 'file', size: '32 KB', modified: '2026-01-15', owner: '관리자' },
        { key: 'f3', name: '출장보고서 양식.docx', type: 'file', size: '38 KB', modified: '2026-01-15', owner: '관리자' },
    ],
    p1: [
        { key: 'f1', name: '프로젝트 일정표.xlsx', type: 'file', size: '2.4 MB', modified: '2026-03-04', owner: '나' },
        { key: 'f2', name: 'API 스펙 문서.pdf', type: 'file', size: '1.8 MB', modified: '2026-03-03', owner: '나' },
        { key: 'f3', name: '와이어프레임.fig', type: 'file', size: '12.1 MB', modified: '2026-03-02', owner: '나' },
    ],
    p2: [
        { key: 'f1', name: '경쟁사 분석.pdf', type: 'file', size: '4.5 MB', modified: '2026-03-02', owner: '나' },
        { key: 'f2', name: '기술 트렌드 정리.docx', type: 'file', size: '890 KB', modified: '2026-02-25', owner: '나' },
    ],
    p3: [
        { key: 'f1', name: '아이디어 메모.txt', type: 'file', size: '8 KB', modified: '2026-03-01', owner: '나' },
    ],
};

const DrivePage: React.FC = () => {
    const { driveType, folderId } = useParams<{ driveType: string; folderId?: string }>();
    const navigate = useNavigate();
    const currentType = driveType || 'company';
    const typeName = typeNameMap[currentType] || '전사 자료실';
    const folders = currentType === 'personal' ? personalFolders : companyFolders;

    // 폴더 선택된 경우: 폴더 내부 파일 보여줌
    if (folderId) {
        const folder = folders.find(f => f.key === folderId);
        const folderName = folder?.name || '폴더';
        const files = folderFilesMap[folderId] || [];

        const fileColumns = [
            {
                title: '이름',
                dataIndex: 'name',
                key: 'name',
                render: (text: string, record: FileItem) => (
                    <Space>
                        {record.type === 'folder'
                            ? <FolderOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
                            : <FileOutlined style={{ color: text.endsWith('.pdf') ? '#FF4D4F' : text.endsWith('.xlsx') ? '#52C41A' : '#1677FF', fontSize: 16 }} />
                        }
                        <span style={{ cursor: 'pointer' }}>{text}</span>
                    </Space>
                ),
            },
            {
                title: '크기',
                dataIndex: 'size',
                key: 'size',
                width: 100,
                render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
            },
            {
                title: '수정일',
                dataIndex: 'modified',
                key: 'modified',
                width: 120,
                render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
            },
            {
                title: '소유자',
                dataIndex: 'owner',
                key: 'owner',
                width: 100,
                render: (text: string) => <span style={{ fontSize: 12 }}>{text}</span>,
            },
        ];

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                            style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
                            onClick={() => navigate(`/drive/${currentType}`)}
                        >
                            {typeName}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/</span>
                        {folderName}
                    </h2>
                    <Space>
                        <Button type="primary" icon={<UploadOutlined />}>업로드</Button>
                    </Space>
                </div>
                <Table
                    columns={fileColumns}
                    dataSource={files}
                    size="small"
                    pagination={false}
                    locale={{ emptyText: '파일이 없습니다' }}
                    onRow={() => ({ style: { height: 42, cursor: 'pointer' } })}
                />
            </div>
        );
    }

    // 폴더 목록 보여줌 (전사/개인 자료실 루트)
    const folderColumns = [
        {
            title: '폴더명',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <FolderOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
                    <span style={{ cursor: 'pointer', fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: '파일 수',
            dataIndex: 'fileCount',
            key: 'fileCount',
            width: 80,
            render: (count: number) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count}개</span>,
        },
        {
            title: '수정일',
            dataIndex: 'modified',
            key: 'modified',
            width: 120,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '소유자',
            dataIndex: 'owner',
            key: 'owner',
            width: 100,
            render: (text: string) => <span style={{ fontSize: 12 }}>{text}</span>,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{typeName}</h2>
                <Space>
                    <Button icon={<FolderAddOutlined />}>새 폴더</Button>
                    <Button type="primary" icon={<UploadOutlined />}>업로드</Button>
                </Space>
            </div>
            <Table
                columns={folderColumns}
                dataSource={folders}
                size="small"
                pagination={false}
                onRow={(record: DriveFolder) => ({
                    style: { height: 42, cursor: 'pointer' },
                    onClick: () => navigate(`/drive/${currentType}/${record.key}`),
                })}
            />
        </div>
    );
};

export default DrivePage;
