import React from 'react';
import { useLocation } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';

/* ─── 사이드바 서브메뉴 컴포넌트 ─── */
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

/* ─── 경로별 메뉴 컨텍스트 ─── */
type MenuType = 'home' | 'approval' | 'mail' | 'alldocs' | 'docmgr' | 'drive' | 'report' | 'attendance' | 'board' | 'calendar' | 'reserve' | 'community' | 'default';

interface MenuContext {
    title: string;
    type: MenuType;
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

/* ─── 타입별 콘텐츠 렌더링 ─── */
const renderContent = (ctx: MenuContext) => {
    switch (ctx.type) {
        case 'home': return <HomeSubMenu />;
        case 'approval': return <ApprovalSubMenu />;
        case 'mail': return <MailSubMenu />;
        case 'alldocs': return <AllDocsSubMenu />;
        case 'docmgr': return <DocMgrSubMenu />;
        case 'drive': return <DriveSubMenu />;
        case 'report': return <ReportSubMenu />;
        case 'attendance': return <AttendanceSubMenu />;
        case 'board': return <BoardSubMenu />;
        case 'calendar': return <CalendarSubMenu />;
        case 'reserve': return <ReserveSubMenu />;
        case 'community': return <CommunitySubMenu />;
        case 'default': return <DefaultSubMenu title={ctx.title} />;
        default: return <DefaultSubMenu title={ctx.title} />;
    }
};

/* ═══ SubMenuPanel ═══ */
const SubMenuPanel: React.FC = () => {
    const location = useLocation();
    const ctx = getMenuContext(location.pathname);

    const handleToggleSidebar = () => {
        console.log('Toggle sidebar');
    };

    return (
        <div
            style={{
                width: 286,
                flexShrink: 0,
                background: 'var(--submenu-bg)',
                borderRight: '1px solid var(--submenu-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Title area (50px) */}
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
                <div
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
                        transition: 'background 0.12s',
                    }}
                    onClick={handleToggleSidebar}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <MenuOutlined />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>{ctx.title}</span>
            </div>

            {/* Content - 경로별 분기 */}
            {renderContent(ctx)}
        </div>
    );
};

export default SubMenuPanel;
