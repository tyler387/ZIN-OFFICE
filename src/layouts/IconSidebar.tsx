import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sidebarMenuItems, sidebarBottomItems, type SidebarMenuItem } from './menuConfig';
import OrgChartPopup from '../components/common/OrgChartPopup';

const IconSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orgPopupVisible, setOrgPopupVisible] = useState(false);

    const isActive = (item: SidebarMenuItem) => {
        if (item.path === '/home') return location.pathname === '/home' || location.pathname === '/';
        return location.pathname.startsWith(item.path);
    };

    const handleItemClick = (item: SidebarMenuItem) => {
        if (item.key === 'org') {
            setOrgPopupVisible(prev => !prev);
            return;
        }
        setOrgPopupVisible(false);
        navigate(item.path);
    };

    const renderItem = (item: SidebarMenuItem) => {
        const active = item.key === 'org' ? orgPopupVisible : isActive(item);
        return (
            <div
                key={item.key}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
                style={{
                    width: '100%',
                    height: 52,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    gap: 3,
                }}
            >
                {item.badge !== undefined && item.badge > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 6,
                            right: 8,
                            background: 'var(--badge-red)',
                            color: '#fff',
                            borderRadius: 10,
                            fontSize: 10,
                            padding: '1px 5px',
                            minWidth: 18,
                            textAlign: 'center',
                            lineHeight: '16px',
                            fontWeight: 600,
                        }}
                    >
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                )}
                <item.icon style={{ fontSize: 18 }} />
                <span style={{ fontSize: 10, lineHeight: '14px' }}>{item.label}</span>
            </div>
        );
    };

    return (
        <>
            <div
                style={{
                    width: 60,
                    flexShrink: 0,
                    background: 'var(--sidebar-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                {/* Logo area */}
                <div
                    style={{
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                        flexShrink: 0,
                    }}
                >
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>GW</span>
                </div>

                {/* Main menu items */}
                <div style={{ flex: 1, paddingTop: 4 }}>
                    {sidebarMenuItems.map(renderItem)}
                </div>

                {/* Bottom fixed items */}
                <div style={{ marginTop: 'auto', paddingBottom: 8 }}>
                    {sidebarBottomItems.map(renderItem)}
                </div>

                <style>{`
            .sidebar-item:hover {
              background: rgba(255,255,255,0.08) !important;
            }
          `}</style>
            </div>

            {/* 조직도 팝업 */}
            <OrgChartPopup visible={orgPopupVisible} onClose={() => setOrgPopupVisible(false)} />
        </>
    );
};

export default IconSidebar;
