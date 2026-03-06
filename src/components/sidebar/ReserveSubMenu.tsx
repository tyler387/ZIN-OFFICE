import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RightOutlined, DownOutlined } from '@ant-design/icons';

const ReserveSubMenu: React.FC = () => {
    const [assetOpen, setAssetOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const items = [
        { label: '회의실', path: '/reserve/room' },
        { label: '화상회의 장비', path: '/reserve/video' },
        { label: '전시장', path: '/reserve/exhibition' },
        { label: '차량', path: '/reserve/vehicle' },
    ];

    const menuItemStyle: React.CSSProperties = {
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 28px',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'background 0.12s',
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 제목 */}
            <div style={{ padding: '14px 16px 10px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                예약
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div
                    style={{
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#666',
                        cursor: 'pointer',
                        letterSpacing: 0.3,
                        userSelect: 'none',
                    }}
                    onClick={() => setAssetOpen(!assetOpen)}
                >
                    {assetOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>전사자산</span>
                </div>
                {assetOpen && items.map(item => {
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

export default ReserveSubMenu;
