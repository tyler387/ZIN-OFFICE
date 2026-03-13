import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Progress } from 'antd';
import {
    DownOutlined,
    DownloadOutlined,
    EditOutlined,
    MoreOutlined,
    PlusOutlined,
    RightOutlined,
    SettingOutlined,
    TagOutlined,
} from '@ant-design/icons';

const MailSubMenu: React.FC = () => {
    const [mailboxOpen, setMailboxOpen] = useState(true);
    const [quickSearchOpen, setQuickSearchOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const currentFolder = location.pathname.replace('/mail/', '') || 'inbox';

    const menuItemStyle: React.CSSProperties = {
        height: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 20px',
        fontSize: 13,
        color: 'var(--submenu-item)',
        cursor: 'pointer',
        transition: 'background 0.12s',
    };

    const badgeStyle: React.CSSProperties = {
        marginLeft: 'auto',
        background: '#EEEEEE',
        color: '#666',
        borderRadius: 9,
        fontSize: 11,
        padding: '0 6px',
        minWidth: 20,
        textAlign: 'center',
        lineHeight: '18px',
        flexShrink: 0,
    };

    const smallBtnStyle: React.CSSProperties = {
        marginLeft: 'auto',
        fontSize: 11,
        color: '#888',
        cursor: 'pointer',
        padding: '1px 6px',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        background: '#fafafa',
        flexShrink: 0,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
    };

    const sectionHeaderStyle: React.CSSProperties = {
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
    };

    const MenuItem: React.FC<{
        label: string;
        folder: string;
        badge?: number;
        right?: React.ReactNode;
        indent?: boolean;
    }> = ({ label, folder, badge, right, indent }) => {
        const active = currentFolder === folder;

        return (
            <div
                style={{
                    ...menuItemStyle,
                    paddingLeft: indent ? 28 : 20,
                    background: active ? 'var(--submenu-active-bg)' : 'transparent',
                    color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                    fontWeight: active ? 600 : 400,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/mail/${folder}`);
                }}
                onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                {badge !== undefined && <span style={badgeStyle}>{badge}</span>}
                {right}
            </div>
        );
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px' }}>
                <Button type="primary" block style={{ height: 36, fontWeight: 600, fontSize: 13 }}>
                    메일쓰기
                </Button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
                <div style={sectionHeaderStyle}>
                    <span style={{ flex: 1 }}>즐겨찾기</span>
                    <EditOutlined style={{ fontSize: 12, color: '#999', cursor: 'pointer' }} />
                </div>
                <MenuItem label="중요 메일함" folder="important" />
                <MenuItem label="받은 메일함" folder="inbox" badge={33} />
                <MenuItem label="읽지 않은 메일" folder="unread" />
                <MenuItem label="오늘 온 메일함" folder="today" />

                <div style={sectionHeaderStyle} onClick={() => setMailboxOpen(!mailboxOpen)}>
                    {mailboxOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>메일함</span>
                </div>
                {mailboxOpen && (
                    <>
                        <MenuItem
                            label="받은 메일함"
                            folder="inbox"
                            badge={33}
                            right={<MoreOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer', marginLeft: 4 }} />}
                        />
                        <MenuItem
                            label="보관 메일함"
                            folder="archive"
                            right={<MoreOutlined style={{ fontSize: 14, color: '#999', cursor: 'pointer', marginLeft: 'auto' }} />}
                        />
                        <MenuItem label="보낸 메일함" folder="sent" right={<span style={smallBtnStyle}>수신확인</span>} />
                        <MenuItem label="임시보관함" folder="draft" />
                        <MenuItem label="예약 메일함" folder="scheduled" />
                        <MenuItem label="스팸 메일함" folder="spam" right={<span style={smallBtnStyle}>비우기</span>} />
                        <MenuItem label="휴지통" folder="trash" badge={578} right={<span style={{ ...smallBtnStyle, marginLeft: 6 }}>비우기</span>} />
                        <MenuItem label="서버 오류 메일함" folder="server-error" />
                        <MenuItem label="서버 오류 메일" folder="server-error-mail" badge={9} indent />

                        <div
                            style={{ ...menuItemStyle, color: '#888', fontSize: 12 }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            메일함 더보기
                        </div>
                        <div
                            style={{ ...menuItemStyle, color: 'var(--primary)', fontSize: 12, gap: 4 }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <PlusOutlined style={{ fontSize: 11 }} />
                            메일함 추가
                        </div>
                    </>
                )}

                <div style={sectionHeaderStyle} onClick={() => setQuickSearchOpen(!quickSearchOpen)}>
                    {quickSearchOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }}>빠른 검색</span>
                </div>
                {quickSearchOpen && (
                    <>
                        <MenuItem label="중요 메일함" folder="important" />
                        <MenuItem label="읽지 않은 메일" folder="unread" />
                        <MenuItem label="읽은 메일함" folder="read" />
                        <MenuItem label="오늘 온 메일함" folder="today" />
                        <MenuItem label="어제 온 메일함" folder="yesterday" />
                        <MenuItem label="첨부 메일함" folder="attachment" />
                        <MenuItem label="답장한 메일함" folder="replied" />
                        <MenuItem label="내가 쓴 메일함" folder="mine" />
                    </>
                )}

                <div style={sectionHeaderStyle}>
                    <TagOutlined style={{ fontSize: 11, marginRight: 4 }} />
                    <span style={{ flex: 1 }}>태그</span>
                    <PlusOutlined style={{ fontSize: 11, color: '#999', cursor: 'pointer' }} />
                </div>

                <div
                    style={{ ...menuItemStyle, gap: 6 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    <DownloadOutlined style={{ fontSize: 13, color: '#888' }} />
                    전체 메일 다운로드
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--submenu-border)', padding: '8px 12px', flexShrink: 0 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#666',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: '4px 0',
                        marginBottom: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                    <SettingOutlined style={{ fontSize: 13 }} />
                    <span>메일 환경설정</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>사용 중</span>
                    <span>2.1 GB / 5 GB</span>
                </div>
                <Progress percent={42} showInfo={false} strokeColor="var(--primary)" size="small" />
            </div>
        </div>
    );
};

export default MailSubMenu;
