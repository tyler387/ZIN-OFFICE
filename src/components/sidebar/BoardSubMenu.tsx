import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RightOutlined, DownOutlined, EditOutlined } from '@ant-design/icons';

const BoardSubMenu: React.FC = () => {
    const [boardOpen, setBoardOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const menuItemStyle: React.CSSProperties = {
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 28px',
        fontSize: 13,
        color: 'var(--submenu-item)',
        cursor: 'pointer',
        transition: 'background 0.12s',
    };

    const items = [
        { label: '공지사항', path: '/board/notice' },
        { label: '자유게시판', path: '/board/free' },
        { label: '질문/답변', path: '/board/qna' },
        { label: '사내소식', path: '/board/news' },
        { label: '자료공유', path: '/board/resources' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 글쓰기 버튼 */}
            <div style={{ padding: '10px 12px' }}>
                <Button
                    type="primary"
                    block
                    icon={<EditOutlined />}
                    style={{ height: 36, fontWeight: 600, fontSize: 13 }}
                    onClick={() => navigate('/board/free/posts/new')}
                >
                    글쓰기
                </Button>
            </div>

            {/* 메뉴 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div
                    style={{
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#666',
                        cursor: 'pointer',
                        letterSpacing: 0.3,
                        userSelect: 'none',
                    }}
                    onClick={() => setBoardOpen(!boardOpen)}
                >
                    {boardOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>게시판</span>
                </div>
                {boardOpen && items.map(item => {
                    const active = currentPath === item.path;
                    return (
                        <div
                            key={item.path}
                            style={{
                                ...menuItemStyle,
                                background: active ? 'var(--submenu-active-bg)' : 'transparent',
                                color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                                fontWeight: active ? 600 : 400,
                            }}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--submenu-active-bg)' : 'transparent'; }}
                        >
                            {item.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BoardSubMenu;
