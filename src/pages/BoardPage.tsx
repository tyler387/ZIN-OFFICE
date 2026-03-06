import React from 'react';
import { Table, Button, Input, Select } from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const boardNames: Record<string, string> = {
    notice: '공지사항',
    free: '자유게시판',
    qna: '질문/답변',
    news: '사내소식',
    resources: '자료공유',
};

const allPosts = [
    { key: '1', boardId: 'notice', num: 5, title: '[공지] 2026년 3월 정기점검 안내', author: '관리자', dept: '총무팀', date: '2026-03-05', views: 142, hasAttach: true },
    { key: '2', boardId: 'notice', num: 4, title: '[공지] 사내 보안 교육 필수 이수 안내', author: '보안팀', dept: '보안팀', date: '2026-03-04', views: 98, hasAttach: false },
    { key: '3', boardId: 'notice', num: 3, title: '[공지] 3월 조직 개편 안내', author: '인사팀', dept: '인사팀', date: '2026-03-03', views: 210, hasAttach: true },
    { key: '4', boardId: 'free', num: 12, title: '금요일 회식 참석 여부 확인', author: '김철수', dept: '개발팀', date: '2026-03-04', views: 56, hasAttach: false },
    { key: '5', boardId: 'free', num: 11, title: '사내 동호회 모집합니다', author: '이영희', dept: '마케팅팀', date: '2026-03-03', views: 73, hasAttach: false },
    { key: '6', boardId: 'free', num: 10, title: '점심 맛집 추천 부탁드려요', author: '박지훈', dept: '디자인팀', date: '2026-03-03', views: 45, hasAttach: false },
    { key: '7', boardId: 'free', num: 9, title: '주말 등산 모임 안내', author: '최동욱', dept: '영업팀', date: '2026-03-02', views: 38, hasAttach: false },
    { key: '8', boardId: 'qna', num: 8, title: 'VPN 연결 관련 문의드립니다', author: '박민수', dept: '개발팀', date: '2026-03-02', views: 31, hasAttach: false },
    { key: '9', boardId: 'qna', num: 7, title: '휴가 신청 절차 문의', author: '정수진', dept: '기획팀', date: '2026-03-01', views: 22, hasAttach: false },
    { key: '10', boardId: 'news', num: 6, title: '3월 우수사원 시상식 안내', author: '인사팀', dept: '인사팀', date: '2026-03-05', views: 187, hasAttach: true },
    { key: '11', boardId: 'news', num: 5, title: '신규 프로젝트 킥오프 미팅 결과', author: '기획팀', dept: '기획팀', date: '2026-03-04', views: 65, hasAttach: true },
    { key: '12', boardId: 'resources', num: 3, title: '2026년 사내 양식 모음 (최신)', author: '총무팀', dept: '총무팀', date: '2026-03-05', views: 320, hasAttach: true },
    { key: '13', boardId: 'resources', num: 2, title: '개발 가이드라인 v2.1', author: '개발팀', dept: '개발팀', date: '2026-03-01', views: 145, hasAttach: true },
];

const BoardPage: React.FC = () => {
    const navigate = useNavigate();
    const { boardId } = useParams<{ boardId: string }>();

    const currentBoard = boardId || 'notice';
    const boardTitle = boardNames[currentBoard] || '게시판';
    const filteredPosts = allPosts.filter(p => p.boardId === currentBoard);

    const columns = [
        {
            title: '번호',
            dataIndex: 'num',
            key: 'num',
            width: 60,
            align: 'center' as const,
            render: (v: number) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</span>,
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string, record: typeof allPosts[0]) => (
                <a
                    onClick={() => navigate(`/board/${record.boardId}/posts/${record.key}`)}
                    style={{ color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}
                >
                    {text}
                    {record.hasAttach && (
                        <PaperClipOutlined style={{ marginLeft: 6, fontSize: 12, color: '#bbb' }} />
                    )}
                </a>
            ),
        },
        {
            title: '작성자',
            dataIndex: 'author',
            key: 'author',
            width: 100,
            render: (text: string, record: typeof allPosts[0]) => (
                <div>
                    <div style={{ fontSize: 13 }}>{text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.dept}</div>
                </div>
            ),
        },
        {
            title: '작성일',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (text: string) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text}</span>,
        },
        {
            title: '조회',
            dataIndex: 'views',
            key: 'views',
            width: 70,
            align: 'center' as const,
            render: (v: number) => (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <EyeOutlined style={{ marginRight: 3 }} />{v}
                </span>
            ),
        },
    ];

    return (
        <div>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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

            {/* 검색 바 */}
            <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 16,
                alignItems: 'center',
            }}>
                <Select
                    defaultValue="title"
                    style={{ width: 110 }}
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
                    style={{ maxWidth: 300 }}
                    size="middle"
                />
                <Button size="middle">검색</Button>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                    총 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{filteredPosts.length}</span>건
                </div>
            </div>

            {/* 테이블 */}
            <Table
                columns={columns}
                dataSource={filteredPosts}
                size="middle"
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
