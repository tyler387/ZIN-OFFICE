import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Progress } from 'antd';
import { RightOutlined, DownOutlined, PlusOutlined, FolderOutlined } from '@ant-design/icons';
import { companyFolders, personalFolders } from '../../data/driveFolders';

const DriveSubMenu: React.FC = () => {
    const [companyOpen, setCompanyOpen] = useState(true);
    const [personalOpen, setPersonalOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

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

    const menuItemStyle: React.CSSProperties = {
        height: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 28px',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'background 0.12s',
    };

    const addBtnStyle: React.CSSProperties = {
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 28px',
        fontSize: 12,
        color: 'var(--primary)',
        cursor: 'pointer',
        gap: 4,
        transition: 'background 0.12s',
    };

    const renderFolder = (folder: { key: string; name: string }, type: string) => {
        const path = `/drive/${type}/${folder.key}`;
        const active = currentPath === path;
        return (
            <div
                key={folder.key}
                style={{
                    ...menuItemStyle,
                    background: active ? 'var(--submenu-active-bg)' : 'transparent',
                    color: active ? 'var(--submenu-active)' : 'var(--submenu-item)',
                    fontWeight: active ? 600 : 400,
                }}
                onClick={() => navigate(path)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--submenu-active-bg)' : 'transparent'; }}
            >
                <FolderOutlined style={{ fontSize: 12, marginRight: 6, color: active ? 'var(--submenu-active)' : '#FAAD14' }} />
                {folder.name}
            </div>
        );
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px' }}>
                <Button type="primary" block style={{ height: 36, fontWeight: 600, fontSize: 13 }}>
                    파일 업로드
                </Button>
            </div>

            <div style={{ padding: '0 12px 10px', borderBottom: '1px solid var(--submenu-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>사용 중</span>
                    <span>3.8 GB / 10 GB</span>
                </div>
                <Progress percent={38} showInfo={false} strokeColor="var(--primary)" size="small" />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
                <div style={sectionHeaderStyle} onClick={() => setCompanyOpen(!companyOpen)}>
                    {companyOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/drive/company'); }}>
                        전사 자료실
                    </span>
                </div>
                {companyOpen && (
                    <>
                        {companyFolders.map(f => renderFolder(f, 'company'))}
                        <div
                            style={addBtnStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <PlusOutlined style={{ fontSize: 11 }} />
                            폴더 추가 (관리자)
                        </div>
                    </>
                )}

                <div style={sectionHeaderStyle} onClick={() => setPersonalOpen(!personalOpen)}>
                    {personalOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <span style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/drive/personal'); }}>
                        개인 자료실
                    </span>
                </div>
                {personalOpen && (
                    <>
                        {personalFolders.map(f => renderFolder(f, 'personal'))}
                        <div
                            style={addBtnStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <PlusOutlined style={{ fontSize: 11 }} />
                            폴더 추가
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DriveSubMenu;
