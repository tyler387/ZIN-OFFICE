import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import IconSidebar from './IconSidebar';
import SubMenuPanel from './SubMenuPanel';
import TopHeader from './TopHeader';

const AppLayout: React.FC = () => {
    const location = useLocation();
    const isMessenger = location.pathname.startsWith('/messenger');

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* ① Icon Sidebar - 60px */}
            <IconSidebar />

            {/* ② SubMenu Panel - 220px */}
            <SubMenuPanel />

            {/* ③ Content Area - flex:1 */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 0,
                }}
            >
                {/* Top Header - 40px */}
                <TopHeader />

                {/* Main Content */}
                <div
                    style={{
                        flex: 1,
                        overflowY: isMessenger ? 'hidden' : 'auto',
                        background: 'var(--content-bg)',
                        padding: isMessenger ? 0 : '20px 24px',
                    }}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
