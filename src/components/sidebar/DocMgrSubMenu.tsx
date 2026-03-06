import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';

const DocMgrSubMenu: React.FC = () => {
    const [docboxOpen, setDocboxOpen] = useState(true);
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
        { label: '최근 열람 문서', path: '/docmgr/recent' },
        { label: '최근 업데이트 문서', path: '/docmgr/updated' },
        { label: '승인 대기 문서', path: '/docmgr/pending-approval' },
        { label: '등록 대기 문서', path: '/docmgr/pending-register' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px' }}>
                <Button type="primary" block style={{ height: 36, fontWeight: 600, fontSize: 13 }}>
                    문서 등록
                </Button>
            </div>

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
                    onClick={() => setDocboxOpen(!docboxOpen)}
                >
                    {docboxOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>문서함</span>
                </div>
                {docboxOpen && items.map(item => {
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

export default DocMgrSubMenu;
