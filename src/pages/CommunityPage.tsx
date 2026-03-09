import React, { useState } from 'react';
import { Table, Input, Tabs } from 'antd';
import { SearchOutlined, TeamOutlined, MessageOutlined } from '@ant-design/icons';

/* ─── 더미 데이터 ─── */
const allCommunities = [
    { key: '1', id: 'dev', name: '개발자 모임', category: '기술', members: 128, latestPost: 'React 19 업데이트 내용 정리', latestAuthor: '김철수', latestDate: '2026-03-09', posts: 342, joined: true },
    { key: '2', id: 'book', name: '독서 클럽', category: '취미', members: 56, latestPost: '3월 추천 도서 목록 공유합니다', latestAuthor: '이영희', latestDate: '2026-03-08', posts: 189, joined: true },
    { key: '3', id: 'fitness', name: '운동/헬스', category: '건강', members: 87, latestPost: '회사 근처 헬스장 추천', latestAuthor: '박지훈', latestDate: '2026-03-08', posts: 256, joined: true },
    { key: '4', id: 'photo', name: '사진 동호회', category: '취미', members: 43, latestPost: '주말 출사 장소 추천해주세요', latestAuthor: '최동욱', latestDate: '2026-03-07', posts: 134, joined: true },
    { key: '5', id: 'food', name: '맛집 탐방', category: '생활', members: 195, latestPost: '강남역 맛집 베스트 10', latestAuthor: '정수진', latestDate: '2026-03-09', posts: 567, joined: true },
    { key: '6', id: 'music', name: '음악 감상', category: '취미', members: 34, latestPost: '이번 주 추천 플레이리스트', latestAuthor: '한지민', latestDate: '2026-03-07', posts: 98, joined: false },
    { key: '7', id: 'travel', name: '여행 모임', category: '생활', members: 112, latestPost: '제주도 3박4일 여행 후기', latestAuthor: '송민호', latestDate: '2026-03-06', posts: 423, joined: false },
    { key: '8', id: 'game', name: '게임 동호회', category: '취미', members: 76, latestPost: '이번 주 게임 대회 안내', latestAuthor: '윤서연', latestDate: '2026-03-06', posts: 312, joined: false },
    { key: '9', id: 'stock', name: '주식/투자', category: '경제', members: 203, latestPost: '3월 둘째 주 시장 전망', latestAuthor: '강동원', latestDate: '2026-03-09', posts: 876, joined: false },
    { key: '10', id: 'pet', name: '반려동물', category: '생활', members: 64, latestPost: '강아지 건강검진 후기', latestAuthor: '임수정', latestDate: '2026-03-05', posts: 201, joined: false },
    { key: '11', id: 'cooking', name: '요리 교실', category: '생활', members: 48, latestPost: '초간단 도시락 레시피 5선', latestAuthor: '배수지', latestDate: '2026-03-05', posts: 156, joined: false },
    { key: '12', id: 'movie', name: '영화 리뷰', category: '취미', members: 91, latestPost: '이번 주 개봉작 기대 순위', latestAuthor: '조인성', latestDate: '2026-03-08', posts: 445, joined: false },
    { key: '13', id: 'design', name: 'UI/UX 디자인', category: '기술', members: 67, latestPost: 'Figma 플러그인 추천', latestAuthor: '김수현', latestDate: '2026-03-07', posts: 178, joined: false },
    { key: '14', id: 'english', name: '영어 스터디', category: '학습', members: 53, latestPost: '매일 영어 회화 챌린지 시작', latestAuthor: '이준기', latestDate: '2026-03-04', posts: 234, joined: false },
    { key: '15', id: 'yoga', name: '요가/명상', category: '건강', members: 29, latestPost: '아침 10분 명상 루틴 공유', latestAuthor: '한효주', latestDate: '2026-03-03', posts: 87, joined: false },
    { key: '16', id: 'startup', name: '사내 벤처', category: '기술', members: 41, latestPost: '아이디어 피칭 데이 일정 안내', latestAuthor: '공유', latestDate: '2026-03-06', posts: 112, joined: false },
    { key: '17', id: 'volunteer', name: '봉사활동', category: '사회', members: 37, latestPost: '3월 봉사활동 참가자 모집', latestAuthor: '손예진', latestDate: '2026-03-04', posts: 95, joined: false },
    { key: '18', id: 'diy', name: 'DIY 공방', category: '취미', members: 22, latestPost: '가죽 공예 체험 후기', latestAuthor: '정해인', latestDate: '2026-03-02', posts: 63, joined: false },
    { key: '19', id: 'golf', name: '골프 모임', category: '건강', members: 58, latestPost: '주말 라운딩 스코어 공유', latestAuthor: '현빈', latestDate: '2026-03-08', posts: 267, joined: false },
    { key: '20', id: 'ai', name: 'AI/머신러닝', category: '기술', members: 94, latestPost: 'GPT-5 활용 사례 공유', latestAuthor: '유아인', latestDate: '2026-03-09', posts: 389, joined: false },
    { key: '21', id: 'board-game', name: '보드게임', category: '취미', members: 31, latestPost: '금요일 보드게임 데이 공지', latestAuthor: '박보검', latestDate: '2026-03-07', posts: 78, joined: false },
    { key: '22', id: 'cycling', name: '자전거 동호회', category: '건강', members: 45, latestPost: '한강 라이딩 코스 추천', latestAuthor: '김태리', latestDate: '2026-03-06', posts: 145, joined: false },
];

/* ─── 최근글 더미 데이터 ─── */
const recentPosts = [
    { key: 'r1', communityName: '맛집 탐방', title: '강남역 맛집 베스트 10', author: '정수진', dept: '기획팀', date: '2026-03-09', views: 234, comments: 18 },
    { key: 'r2', communityName: '개발자 모임', title: 'React 19 업데이트 내용 정리', author: '김철수', dept: '개발팀', date: '2026-03-09', views: 187, comments: 24 },
    { key: 'r3', communityName: '주식/투자', title: '3월 둘째 주 시장 전망', author: '강동원', dept: '재무팀', date: '2026-03-09', views: 312, comments: 45 },
    { key: 'r4', communityName: 'AI/머신러닝', title: 'GPT-5 활용 사례 공유', author: '유아인', dept: '개발팀', date: '2026-03-09', views: 156, comments: 12 },
    { key: 'r5', communityName: '독서 클럽', title: '3월 추천 도서 목록 공유합니다', author: '이영희', dept: '마케팅팀', date: '2026-03-08', views: 98, comments: 8 },
    { key: 'r6', communityName: '운동/헬스', title: '회사 근처 헬스장 추천', author: '박지훈', dept: '디자인팀', date: '2026-03-08', views: 76, comments: 15 },
    { key: 'r7', communityName: '영화 리뷰', title: '이번 주 개봉작 기대 순위', author: '조인성', dept: '영업팀', date: '2026-03-08', views: 143, comments: 21 },
    { key: 'r8', communityName: '골프 모임', title: '주말 라운딩 스코어 공유', author: '현빈', dept: '경영지원팀', date: '2026-03-08', views: 89, comments: 7 },
    { key: 'r9', communityName: '사진 동호회', title: '주말 출사 장소 추천해주세요', author: '최동욱', dept: '영업팀', date: '2026-03-07', views: 67, comments: 11 },
    { key: 'r10', communityName: '음악 감상', title: '이번 주 추천 플레이리스트', author: '한지민', dept: '인사팀', date: '2026-03-07', views: 54, comments: 6 },
    { key: 'r11', communityName: 'UI/UX 디자인', title: 'Figma 플러그인 추천', author: '김수현', dept: '디자인팀', date: '2026-03-07', views: 112, comments: 9 },
    { key: 'r12', communityName: '보드게임', title: '금요일 보드게임 데이 공지', author: '박보검', dept: '개발팀', date: '2026-03-07', views: 43, comments: 5 },
    { key: 'r13', communityName: '여행 모임', title: '제주도 3박4일 여행 후기', author: '송민호', dept: '마케팅팀', date: '2026-03-06', views: 198, comments: 32 },
    { key: 'r14', communityName: '게임 동호회', title: '이번 주 게임 대회 안내', author: '윤서연', dept: '개발팀', date: '2026-03-06', views: 87, comments: 14 },
    { key: 'r15', communityName: '사내 벤처', title: '아이디어 피칭 데이 일정 안내', author: '공유', dept: '기획팀', date: '2026-03-06', views: 76, comments: 4 },
    { key: 'r16', communityName: '자전거 동호회', title: '한강 라이딩 코스 추천', author: '김태리', dept: '인사팀', date: '2026-03-06', views: 62, comments: 8 },
    { key: 'r17', communityName: '요리 교실', title: '초간단 도시락 레시피 5선', author: '배수지', dept: '총무팀', date: '2026-03-05', views: 134, comments: 19 },
    { key: 'r18', communityName: '반려동물', title: '강아지 건강검진 후기', author: '임수정', dept: '마케팅팀', date: '2026-03-05', views: 91, comments: 13 },
];

const CommunityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('recent');
    const [searchText, setSearchText] = useState('');

    /* ─── 탭별 데이터 필터 ─── */
    const getFilteredCommunities = () => {
        let data = allCommunities;
        if (activeTab === 'joined') {
            data = data.filter(c => c.joined);
        }
        if (searchText) {
            data = data.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()));
        }
        return data;
    };

    const getFilteredRecentPosts = () => {
        let data = recentPosts;
        if (searchText) {
            data = data.filter(p => p.communityName.toLowerCase().includes(searchText.toLowerCase()));
        }
        return data;
    };

    /* ─── 커뮤니티 목록 컬럼 (가입커뮤니티 / 전체커뮤니티 탭) ─── */
    const communityColumns = [
        {
            title: '커뮤니티명',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    <TeamOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                    {text}
                </span>
            ),
        },
        {
            title: '카테고리',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (text: string) => {
                const colorMap: Record<string, string> = {
                    '기술': '#1677ff', '취미': '#52c41a', '생활': '#fa8c16',
                    '건강': '#eb2f96', '경제': '#722ed1', '학습': '#13c2c2',
                    '사회': '#fa541c',
                };
                return (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: `${colorMap[text] || '#999'}15`,
                        color: colorMap[text] || '#999',
                        fontWeight: 500,
                    }}>
                        {text}
                    </span>
                );
            },
        },
        {
            title: '멤버',
            dataIndex: 'members',
            key: 'members',
            width: 80,
            align: 'center' as const,
            render: (v: number) => (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <TeamOutlined style={{ marginRight: 3 }} />{v}
                </span>
            ),
        },
        {
            title: '최근 글',
            dataIndex: 'latestPost',
            key: 'latestPost',
            ellipsis: true,
            render: (text: string, record: typeof allCommunities[0]) => (
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {record.latestAuthor} · {record.latestDate}
                    </div>
                </div>
            ),
        },
        {
            title: '게시글',
            dataIndex: 'posts',
            key: 'posts',
            width: 80,
            align: 'center' as const,
            render: (v: number) => (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <MessageOutlined style={{ marginRight: 3 }} />{v}
                </span>
            ),
        },
    ];

    /* ─── 최근글 컬럼 ─── */
    const recentColumns = [
        {
            title: '커뮤니티',
            dataIndex: 'communityName',
            key: 'communityName',
            width: 140,
            render: (text: string) => (
                <span style={{ fontWeight: 500, color: '#1677ff', fontSize: 13 }}>
                    <TeamOutlined style={{ marginRight: 4 }} />{text}
                </span>
            ),
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}>
                    {text}
                </span>
            ),
        },
        {
            title: '작성자',
            dataIndex: 'author',
            key: 'author',
            width: 100,
            render: (text: string, record: typeof recentPosts[0]) => (
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
            render: (v: number) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</span>,
        },
        {
            title: '댓글',
            dataIndex: 'comments',
            key: 'comments',
            width: 70,
            align: 'center' as const,
            render: (v: number) => (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <MessageOutlined style={{ marginRight: 3 }} />{v}
                </span>
            ),
        },
    ];

    /* ─── 탭 구성 ─── */
    const tabItems = [
        { key: 'recent', label: '최근글' },
        { key: 'joined', label: '가입 커뮤니티' },
        { key: 'all', label: '전체 커뮤니티' },
    ];

    const isRecentTab = activeTab === 'recent';

    const paginationConfig = {
        pageSize: 10,
        showSizeChanger: false as const,
        position: ['bottomCenter'] as ('bottomCenter')[],
        style: { marginTop: 20 },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 헤더 - 탭 */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                    커뮤니티
                </h2>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => { setActiveTab(key); setSearchText(''); }}
                    items={tabItems}
                    style={{ marginBottom: 0 }}
                />
            </div>

            {/* 게시글 수 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    총 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isRecentTab ? getFilteredRecentPosts().length : getFilteredCommunities().length}
                    </span>건
                </span>
            </div>

            {/* 테이블 */}
            <div style={{ flex: 1, minHeight: 0 }}>
                {isRecentTab ? (
                    <Table
                        columns={recentColumns}
                        dataSource={getFilteredRecentPosts()}
                        size="middle"
                        pagination={paginationConfig}
                        style={{ fontSize: 13 }}
                    />
                ) : (
                    <Table
                        columns={communityColumns}
                        dataSource={getFilteredCommunities()}
                        size="middle"
                        pagination={paginationConfig}
                        style={{ fontSize: 13 }}
                    />
                )}
            </div>

            {/* 푸터 - 검색 */}
            <div style={{
                padding: '12px 0',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
            }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>커뮤니티 검색</span>
                <Input
                    placeholder="커뮤니티 명을 입력하세요"
                    prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                    style={{ maxWidth: 320 }}
                    size="middle"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </div>
        </div>
    );
};

export default CommunityPage;
