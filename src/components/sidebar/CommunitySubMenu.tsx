import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RightOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';

const CommunitySubMenu: React.FC = () => {
    const [myOpen, setMyOpen] = useState(true);
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

    const myCommunities = [
        { label: '개발자 모임', path: '/community/dev' },
        { label: '독서 클럽', path: '/community/book' },
        { label: '운동/헬스', path: '/community/fitness' },
        { label: '사진 동호회', path: '/community/photo' },
        { label: '맛집 탐방', path: '/community/food' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 커뮤니티 추가 버튼 */}
            <div style={{ padding: '10px 12px' }}>
                <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    style={{ height: 36, fontWeight: 600, fontSize: 13 }}
                    onClick={() => {/* 커뮤니티 추가 모달 */ }}
                >
                    커뮤니티 추가
                </Button>
            </div>

            {/* 메뉴 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* 가입한 커뮤니티 */}
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
                    onClick={() => setMyOpen(!myOpen)}
                >
                    {myOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>가입한 커뮤니티</span>
                </div>
                {myOpen && myCommunities.map(item => {
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

export default CommunitySubMenu;
