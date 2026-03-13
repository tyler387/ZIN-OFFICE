import React from 'react';
import { useLocation } from 'react-router-dom';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import HomeSubMenu from '../components/sidebar/HomeSubMenu';
import ApprovalSubMenu from '../components/sidebar/ApprovalSubMenu';
import MailSubMenu from '../components/sidebar/MailSubMenu';
import AllDocsSubMenu from '../components/sidebar/AllDocsSubMenu';
import DocMgrSubMenu from '../components/sidebar/DocMgrSubMenu';
import DriveSubMenu from '../components/sidebar/DriveSubMenu';
import ReportSubMenu from '../components/sidebar/ReportSubMenu';
import AttendanceSubMenu from '../components/sidebar/AttendanceSubMenu';
import BoardSubMenu from '../components/sidebar/BoardSubMenu';
import CalendarSubMenu from '../components/sidebar/CalendarSubMenu';
import ReserveSubMenu from '../components/sidebar/ReserveSubMenu';
import CommunitySubMenu from '../components/sidebar/CommunitySubMenu';
import DefaultSubMenu from '../components/sidebar/DefaultSubMenu';

type MenuType =
    | 'home'
    | 'approval'
    | 'mail'
    | 'alldocs'
    | 'docmgr'
    | 'drive'
    | 'report'
    | 'attendance'
    | 'board'
    | 'calendar'
    | 'reserve'
    | 'community'
    | 'default';

interface MenuContext {
    title: string;
    type: MenuType;
}

interface SubMenuPanelProps {
    isMobile?: boolean;
    onToggleSidebar?: () => void;
}

const getMenuContext = (path: string): MenuContext => {
    if (path === '/' || path.startsWith('/home')) return { title: '홈', type: 'home' };
    if (path.startsWith('/approval')) return { title: '전자결재', type: 'approval' };
    if (path.startsWith('/mail')) return { title: '메일', type: 'mail' };
    if (path.startsWith('/board')) return { title: '게시판', type: 'board' };
    if (path.startsWith('/drive')) return { title: '자료실', type: 'drive' };
    if (path.startsWith('/alldocs')) return { title: '전사 문서함', type: 'alldocs' };
    if (path.startsWith('/docmgr')) return { title: '문서관리', type: 'docmgr' };
    if (path.startsWith('/report')) return { title: '보고', type: 'report' };
    if (path.startsWith('/attendance')) return { title: '근태관리', type: 'attendance' };
    if (path.startsWith('/messenger')) return { title: '메신저', type: 'default' };
    if (path.startsWith('/calendar')) return { title: '캘린더', type: 'calendar' };
    if (path.startsWith('/reserve')) return { title: '예약', type: 'reserve' };
    if (path.startsWith('/community')) return { title: '커뮤니티', type: 'community' };
    return { title: '홈', type: 'home' };
};

const renderContent = (ctx: MenuContext) => {
    switch (ctx.type) {
        case 'home':
            return <HomeSubMenu />;
        case 'approval':
            return <ApprovalSubMenu />;
        case 'mail':
            return <MailSubMenu />;
        case 'alldocs':
            return <AllDocsSubMenu />;
        case 'docmgr':
            return <DocMgrSubMenu />;
        case 'drive':
            return <DriveSubMenu />;
        case 'report':
            return <ReportSubMenu />;
        case 'attendance':
            return <AttendanceSubMenu />;
        case 'board':
            return <BoardSubMenu />;
        case 'calendar':
            return <CalendarSubMenu />;
        case 'reserve':
            return <ReserveSubMenu />;
        case 'community':
            return <CommunitySubMenu />;
        case 'default':
            return <DefaultSubMenu title={ctx.title} />;
        default:
            return <DefaultSubMenu title={ctx.title} />;
    }
};

const SubMenuPanel: React.FC<SubMenuPanelProps> = ({ isMobile = false, onToggleSidebar }) => {
    const location = useLocation();
    const ctx = getMenuContext(location.pathname);

    return (
        <div
            style={{
                width: isMobile ? '100%' : 286,
                flex: isMobile ? 1 : '0 0 286px',
                background: 'var(--submenu-bg)',
                borderRight: isMobile ? 'none' : '1px solid var(--submenu-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                minWidth: 0,
            }}
        >
            <div
                style={{
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 12px',
                    borderBottom: '1px solid var(--submenu-border)',
                    flexShrink: 0,
                }}
            >
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: 16,
                        background: 'transparent',
                        border: 'none',
                    }}
                >
                    {isMobile ? <CloseOutlined /> : <MenuOutlined />}
                </button>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>{ctx.title}</span>
            </div>

            {renderContent(ctx)}
        </div>
    );
};

export default SubMenuPanel;
