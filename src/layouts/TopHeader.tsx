import React from 'react';
import { Input, Select, Badge, Avatar, Dropdown, type MenuProps, message } from 'antd';
import {
    SearchOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

const TopHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            message.success('로그아웃 되었습니다.');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            message.error('로그아웃 처리 중 오류가 발생했습니다.');
        }
    };

    const profileMenu: MenuProps = {
        items: [
            { key: 'name', label: user?.name || '사용자', disabled: true, style: { fontWeight: 600, color: '#222' } },
            { key: 'email', label: user?.email || '', disabled: true, style: { fontSize: 12, color: '#999' } },
            { type: 'divider' },
            { key: 'logout', label: '로그아웃', onClick: handleLogout },
        ],
    };

    return (
        <div
            style={{
                height: 50,
                background: '#FFFFFF',
                borderBottom: '1px solid var(--border)',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
                flexShrink: 0,
            }}
        >
            {/* Search scope select */}
            <Select
                defaultValue="approval"
                size="small"
                style={{ width: 100 }}
                options={[
                    { value: 'approval', label: '전자결재' },
                    { value: 'all', label: '전체' },
                    { value: 'mail', label: '메일' },
                    { value: 'board', label: '게시판' },
                ]}
            />

            {/* Search input */}
            <Input
                placeholder="검색"
                size="small"
                style={{ width: 180 }}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
            />

            {/* Detail button */}
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
                상세 ▼
            </span>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />

            {/* Help icon */}
            <QuestionCircleOutlined
                style={{ fontSize: 16, color: '#666', cursor: 'pointer', padding: 4 }}
            />

            {/* Notification bell */}
            <Badge count={5} size="small" offset={[-2, 2]}>
                <BellOutlined style={{ fontSize: 16, color: '#666', cursor: 'pointer', padding: 4 }} />
            </Badge>

            {/* Profile avatar */}
            <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
                <Avatar
                    size={28}
                    icon={<UserOutlined />}
                    style={{
                        cursor: 'pointer',
                        background: 'var(--primary)',
                        marginLeft: 4,
                    }}
                />
            </Dropdown>
        </div>
    );
};

export default TopHeader;
