import React from 'react';
import { Input, Avatar, Badge } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

const dummyChatList = [
    { key: '1', name: '김철수', lastMsg: '회의 시간이 변경됐습니다', time: '10:32', unread: 3 },
    { key: '2', name: '개발팀 그룹', lastMsg: '배포 완료했습니다', time: '09:15', unread: 0 },
    { key: '3', name: '이영희', lastMsg: '자료 확인 부탁드립니다', time: '어제', unread: 1 },
    { key: '4', name: 'IT서비스 공지', lastMsg: 'VPN 점검 안내', time: '어제', unread: 0 },
    { key: '5', name: '박민수', lastMsg: '네 알겠습니다!', time: '03/03', unread: 0 },
];

const MessengerPage: React.FC = () => {
    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Chat list */}
            <div
                style={{
                    width: 280,
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                }}
            >
                <div style={{ padding: '12px' }}>
                    <Input
                        placeholder="대화 검색"
                        prefix={<SearchOutlined style={{ color: '#999' }} />}
                        size="small"
                        style={{ borderRadius: 6 }}
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {dummyChatList.map(chat => (
                        <div
                            key={chat.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 12px',
                                cursor: 'pointer',
                                gap: 10,
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Avatar icon={<UserOutlined />} style={{ background: 'var(--primary)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 500, fontSize: 13 }}>{chat.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{chat.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {chat.lastMsg}
                                    </span>
                                    {chat.unread > 0 && (
                                        <Badge count={chat.unread} size="small" style={{ backgroundColor: 'var(--badge-red)' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <p>대화를 선택해주세요</p>
            </div>
        </div>
    );
};

export default MessengerPage;
