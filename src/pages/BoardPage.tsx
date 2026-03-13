import React from 'react';
import { Button, Input, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PaperClipOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

type BoardPost = {
    key: string;
    boardId: string;
    num: number;
    title: string;
    author: string;
    dept: string;
    date: string;
    views: number;
    hasAttach: boolean;
};

const boardNames: Record<string, string> = {
    notice: '공지사항',
    free: '자유게시판',
    qna: '질문답변',
    news: '사내소식',
    resources: '자료공유',
};

const allPosts: BoardPost[] = [
    { key: '1', boardId: 'notice', num: 5, title: '3월 정기 점검 안내', author: '관리자', dept: '운영팀', date: '2026-03-05', views: 142, hasAttach: true },
    { key: '2', boardId: 'notice', num: 4, title: '보안 교육 이수 안내', author: '보안팀', dept: '보안팀', date: '2026-03-04', views: 98, hasAttach: false },
    { key: '3', boardId: 'free', num: 12, title: '점심 모임 참석 체크', author: '김대리', dept: '개발팀', date: '2026-03-04', views: 56, hasAttach: false },
    { key: '4', boardId: 'qna', num: 8, title: 'VPN 연결 관련 문의', author: '박주임', dept: '개발팀', date: '2026-03-02', views: 31, hasAttach: false },
    { key: '5', boardId: 'news', num: 6, title: '신규 프로젝트 킥오프 요약', author: '기획팀', dept: '기획팀', date: '2026-03-05', views: 187, hasAttach: true },
    { key: '6', boardId: 'resources', num: 3, title: '최신 디자인 자료 모음', author: '운영팀', dept: '운영팀', date: '2026-03-05', views: 320, hasAttach: true },
];

const BoardPage: React.FC = () => {
    const navigate = useNavigate();
    const { boardId } = useParams<{ boardId: string }>();
    const { isMobile } = useResponsive();

    const currentBoard = boardId || 'notice';
    const boardTitle = boardNames[currentBoard] || '게시판';
    const filteredPosts = allPosts.filter((post) => post.boardId === currentBoard);

    const columns: ColumnsType<BoardPost> = [
        {
            title: '번호',
            dataIndex: 'num',
            key: 'num',
            width: 60,
            responsive: ['md'],
            align: 'center',
            render: (value: number) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{value}</span>,
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string, record: BoardPost) => (
                <a
                    onClick={() => navigate(`/board/${record.boardId}/posts/${record.key}`)}
                    style={{ color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}
                >
                    {text}
                    {record.hasAttach && <PaperClipOutlined style={{ marginLeft: 6, fontSize: 12, color: '#bbb' }} />}
                </a>
            ),
        },
        {
            title: '작성자',
            dataIndex: 'author',
            key: 'author',
            width: isMobile ? 88 : 100,
            render: (text: string, record: BoardPost) => (
                <div>
                    <div style={{ fontSize: 13 }}>{text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.dept}</div>
                </div>
            ),
        },
        {
            title: '등록일',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            responsive: ['md'],
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '조회수',
            dataIndex: 'views',
            key: 'views',
            width: 80,
            responsive: ['md'],
            align: 'center',
            render: (value: number) => (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <EyeOutlined style={{ marginRight: 3 }} />
                    {value}
                </span>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    marginBottom: 20,
                    gap: 12,
                    flexDirection: isMobile ? 'column' : 'row',
                }}
            >
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {boardTitle}
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/board/${currentBoard}/posts/new`)}
                    style={{ fontWeight: 500 }}
                >
                    글쓰기
                </Button>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <Select
                    defaultValue="title"
                    style={{ width: isMobile ? '100%' : 110 }}
                    size="middle"
                    options={[
                        { value: 'title', label: '제목' },
                        { value: 'author', label: '작성자' },
                        { value: 'content', label: '내용' },
                    ]}
                />
                <Input
                    placeholder="검색어를 입력하세요"
                    prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                    style={{ width: isMobile ? '100%' : 300, maxWidth: '100%' }}
                    size="middle"
                />
                <Button size="middle">검색</Button>
                <div style={{ marginLeft: isMobile ? 0 : 'auto', width: isMobile ? '100%' : 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                    총 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{filteredPosts.length}</span>건
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredPosts}
                size="middle"
                scroll={{ x: isMobile ? 560 : undefined }}
                pagination={{
                    pageSize: 15,
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                    style: { marginTop: 20 },
                }}
                style={{ fontSize: 13 }}
            />
        </div>
    );
};

export default BoardPage;
