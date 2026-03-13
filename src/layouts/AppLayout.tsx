import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Drawer } from 'antd';
import IconSidebar from './IconSidebar';
import SubMenuPanel from './SubMenuPanel';
import TopHeader from './TopHeader';

const MOBILE_BREAKPOINT = 1024;

const AppLayout: React.FC = () => {
    const location = useLocation();
    const isMessenger = location.pathname.startsWith('/messenger');
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const nextIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(nextIsMobile);

            if (!nextIsMobile) {
                setMobileNavOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

    return (
        <div
            style={{
                display: 'flex',
                height: '100dvh',
                minHeight: '100vh',
                overflow: 'hidden',
                background: 'var(--content-bg)',
            }}
        >
            {!isMobile && <IconSidebar />}
            {!isMobile && <SubMenuPanel />}

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 0,
                }}
            >
                <TopHeader isMobile={isMobile} onMenuClick={() => setMobileNavOpen(true)} />

                <div
                    style={{
                        flex: 1,
                        overflowY: isMessenger ? 'hidden' : 'auto',
                        overflowX: 'hidden',
                        background: 'var(--content-bg)',
                        padding: isMessenger
                            ? 0
                            : isMobile
                                ? '12px 12px calc(20px + env(safe-area-inset-bottom))'
                                : '20px 24px',
                    }}
                >
                    <Outlet />
                </div>
            </div>

            <Drawer
                placement="left"
                open={isMobile && mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                closable={false}
                width="min(92vw, 360px)"
                styles={{
                    body: {
                        padding: 0,
                        height: '100%',
                    },
                }}
            >
                <div style={{ display: 'flex', height: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <IconSidebar onNavigate={() => setMobileNavOpen(false)} />
                    <SubMenuPanel isMobile onToggleSidebar={() => setMobileNavOpen(false)} />
                </div>
            </Drawer>
        </div>
    );
};

export default AppLayout;
