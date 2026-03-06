import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { approvalSubMenu } from '../../layouts/menuConfig';

const ApprovalSubMenu: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
                <div style={{ padding: 12 }}>
                    <Button block>새 결재 진행</Button>
                </div>

                {approvalSubMenu.map((section) => (
                    <div key={section.label}>
                        <div
                            style={{
                                fontSize: 11,
                                color: 'var(--submenu-label)',
                                fontWeight: 500,
                                padding: '14px 16px 4px 16px',
                                letterSpacing: 0.3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span>{section.label}</span>
                            {section.showSettingsIcon && (
                                <SettingOutlined
                                    style={{ fontSize: 12, color: '#999', cursor: 'pointer' }}
                                    onClick={() => console.log('Settings clicked')}
                                />
                            )}
                        </div>

                        {section.items.map((item) => {
                            const active = item.path ? location.pathname === item.path : false;
                            const paddingLeft = item.depth === 2 ? 28 : item.depth === 3 ? 40 : 20;
                            const isSectionHeader = item.key === 'dept-it';

                            return (
                                <div
                                    key={item.key}
                                    onClick={() => item.path && navigate(item.path)}
                                    style={{
                                        height: 32,
                                        padding: `0 16px 0 ${paddingLeft}px`,
                                        fontSize: 13,
                                        color: active
                                            ? 'var(--submenu-active)'
                                            : item.italic
                                                ? '#999'
                                                : isSectionHeader
                                                    ? '#444'
                                                    : 'var(--submenu-item)',
                                        fontWeight: active ? 600 : isSectionHeader ? 500 : 400,
                                        fontStyle: item.italic ? 'italic' : 'normal',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: active ? 'var(--submenu-active-bg)' : 'transparent',
                                        transition: 'background 0.15s, color 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) e.currentTarget.style.background = 'var(--submenu-hover)';
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.label}
                                    </span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span
                                            style={{
                                                marginLeft: 'auto',
                                                background: '#EEEEEE',
                                                color: '#666666',
                                                borderRadius: 9,
                                                fontSize: 11,
                                                padding: '1px 6px',
                                                minWidth: 20,
                                                textAlign: 'center',
                                                lineHeight: '18px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div
                style={{
                    padding: '8px 16px',
                    borderTop: '1px solid var(--submenu-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#666',
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
                <SettingOutlined style={{ fontSize: 13 }} />
                <span>전자결재 환경설정</span>
            </div>
        </>
    );
};

export default ApprovalSubMenu;
