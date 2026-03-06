import React from 'react';
import { useLocation } from 'react-router-dom';

const AllDocsSubMenu: React.FC = () => {
    const location = useLocation();
    const active = location.pathname.startsWith('/alldocs');

    return (
        <div style={{ flex: 1, paddingTop: 4 }}>
            <div
                style={{
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                    background: active ? 'var(--submenu-active-bg)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--submenu-active-bg)' : 'transparent'; }}
            >
                전사 문서함
            </div>
        </div>
    );
};

export default AllDocsSubMenu;
