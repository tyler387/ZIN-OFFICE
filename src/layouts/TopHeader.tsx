import React from 'react';
import { Avatar, Badge, Dropdown, Input, Select, type MenuProps, message } from 'antd';
import {
    BellOutlined,
    MenuOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

interface TopHeaderProps {
    isMobile?: boolean;
    onMenuClick?: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ isMobile = false, onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            message.success('Logged out.');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            message.error('Failed to log out.');
        }
    };

    const profileMenu: MenuProps = {
        items: [
            { key: 'name', label: user?.name || 'User', disabled: true, style: { fontWeight: 600, color: '#222' } },
            { key: 'email', label: user?.email || '', disabled: true, style: { fontSize: 12, color: '#999' } },
            { type: 'divider' },
            { key: 'logout', label: 'Logout', onClick: handleLogout },
        ],
    };

    return (
        <div
            style={{
                height: isMobile ? 56 : 50,
                background: '#FFFFFF',
                borderBottom: '1px solid var(--border)',
                padding: isMobile ? '0 12px' : '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? 8 : 4,
                flexShrink: 0,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {isMobile && (
                    <button
                        type="button"
                        onClick={onMenuClick}
                        style={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: '#444',
                            background: '#F5F5F5',
                            border: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <MenuOutlined style={{ fontSize: 18 }} />
                    </button>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: 600, color: '#222' }}>
                        {user?.name || 'User'}
                    </span>
                    {isMobile && (
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 160,
                            }}
                        >
                            {user?.employee?.department?.name || ''}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 4, minWidth: 0 }}>
                {!isMobile && (
                    <>
                        <Select
                            defaultValue="approval"
                            size="small"
                            style={{ width: 100 }}
                            options={[
                                { value: 'approval', label: 'Approval' },
                                { value: 'all', label: 'All' },
                                { value: 'mail', label: 'Mail' },
                                { value: 'board', label: 'Board' },
                            ]}
                        />
                        <Input
                            placeholder="Search"
                            size="small"
                            style={{ width: 180 }}
                            suffix={<SearchOutlined style={{ color: '#999' }} />}
                        />
                        <span
                            style={{
                                fontSize: 12,
                                color: '#666',
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: 4,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Detail
                        </span>
                        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
                        <QuestionCircleOutlined style={{ fontSize: 16, color: '#666', cursor: 'pointer', padding: 4 }} />
                    </>
                )}

                {isMobile && (
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 16,
                            background: '#F5F5F5',
                            color: '#666',
                            flexShrink: 0,
                        }}
                    >
                        <SearchOutlined style={{ fontSize: 15 }} />
                    </div>
                )}

                <Badge count={5} size="small" offset={[-2, 2]}>
                    <BellOutlined style={{ fontSize: 16, color: '#666', cursor: 'pointer', padding: 4 }} />
                </Badge>

                <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
                    <Avatar
                        size={28}
                        icon={<UserOutlined />}
                        style={{
                            cursor: 'pointer',
                            background: 'var(--primary)',
                            marginLeft: isMobile ? 0 : 4,
                            flexShrink: 0,
                        }}
                    />
                </Dropdown>
            </div>
        </div>
    );
};

export default TopHeader;
