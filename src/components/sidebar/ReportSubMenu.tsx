import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RightOutlined, DownOutlined } from '@ant-design/icons';

const ReportSubMenu: React.FC = () => {
    const [reportOpen, setReportOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const items = [
        { label: '부서별 보고서', path: '/report/department' },
    ];

    return (
        <div style={{ flex: 1, paddingTop: 4 }}>
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
                onClick={() => setReportOpen(!reportOpen)}
            >
                {reportOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                <span style={{ flex: 1 }}>보고</span>
            </div>
            {reportOpen && items.map(item => {
                const active = currentPath === item.path;
                return (
                    <div
                        key={item.path}
                        style={{
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 12px 0 28px',
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                            background: active ? 'var(--submenu-active-bg)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
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
    );
};

export default ReportSubMenu;
