import React, { useState } from 'react';
import { Input, Avatar } from 'antd';
import {
    CloseOutlined,
    SearchOutlined,
    RightOutlined,
    DownOutlined,
    UserOutlined,
} from '@ant-design/icons';

type OrgMember = {
    name: string;
    position: string;
    dept: string;
    avatar?: string;
};

type OrgDept = {
    name: string;
    children?: OrgDept[];
    members?: OrgMember[];
};

const orgData: OrgDept[] = [
    {
        name: '대표이사',
        members: [{ name: '김대표', position: '대표이사', dept: '대표이사' }],
        children: [
            {
                name: '경영지원본부',
                children: [
                    {
                        name: '총무팀',
                        members: [
                            { name: '박총무', position: '팀장', dept: '총무팀' },
                            { name: '관리자', position: '대리', dept: '총무팀' },
                        ],
                    },
                    {
                        name: '인사팀',
                        members: [
                            { name: '이인사', position: '팀장', dept: '인사팀' },
                            { name: '인사팀', position: '사원', dept: '인사팀' },
                        ],
                    },
                ],
            },
            {
                name: '개발본부',
                children: [
                    {
                        name: '개발팀',
                        members: [
                            { name: '김철수', position: '팀장', dept: '개발팀' },
                            { name: '박민수', position: '선임', dept: '개발팀' },
                            { name: '박지훈', position: '사원', dept: '개발팀' },
                        ],
                    },
                    {
                        name: '디자인팀',
                        members: [
                            { name: '이디자', position: '팀장', dept: '디자인팀' },
                        ],
                    },
                ],
            },
            {
                name: '영업본부',
                children: [
                    {
                        name: '영업팀',
                        members: [
                            { name: '최동욱', position: '팀장', dept: '영업팀' },
                        ],
                    },
                    {
                        name: '마케팅팀',
                        members: [
                            { name: '이영희', position: '팀장', dept: '마케팅팀' },
                        ],
                    },
                ],
            },
        ],
    },
];

interface OrgChartPopupProps {
    visible: boolean;
    onClose: () => void;
}

const OrgChartPopup: React.FC<OrgChartPopupProps> = ({ visible, onClose }) => {
    const [searchText, setSearchText] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['대표이사', '개발본부']));

    const toggleExpand = (name: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const renderDept = (dept: OrgDept, depth: number = 0): React.ReactNode => {
        const isOpen = expanded.has(dept.name);
        const hasChildren = (dept.children && dept.children.length > 0) || (dept.members && dept.members.length > 0);

        // 검색 필터
        if (searchText) {
            const matchesDept = dept.name.toLowerCase().includes(searchText.toLowerCase());
            const matchesMembers = dept.members?.some(m =>
                m.name.toLowerCase().includes(searchText.toLowerCase()) ||
                m.position.toLowerCase().includes(searchText.toLowerCase())
            );
            const childrenMatch = dept.children?.some(c => {
                const cMatch = c.name.toLowerCase().includes(searchText.toLowerCase());
                const mMatch = c.members?.some(m =>
                    m.name.toLowerCase().includes(searchText.toLowerCase())
                );
                return cMatch || mMatch;
            });
            if (!matchesDept && !matchesMembers && !childrenMatch) return null;
        }

        return (
            <div key={dept.name}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: `4px ${8 + depth * 16}px`,
                        cursor: hasChildren ? 'pointer' : 'default',
                        fontSize: 13,
                        fontWeight: depth === 0 ? 600 : 500,
                        color: 'var(--text-primary)',
                        borderRadius: 4,
                        transition: 'background 0.12s',
                    }}
                    onClick={() => hasChildren && toggleExpand(dept.name)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    {hasChildren && (
                        isOpen
                            ? <DownOutlined style={{ fontSize: 9, marginRight: 6, color: '#999' }} />
                            : <RightOutlined style={{ fontSize: 9, marginRight: 6, color: '#999' }} />
                    )}
                    <span>{dept.name}</span>
                    {dept.members && (
                        <span style={{ marginLeft: 4, fontSize: 11, color: '#999' }}>
                            ({dept.members.length})
                        </span>
                    )}
                </div>
                {(isOpen || searchText) && (
                    <>
                        {dept.members?.map(m => (
                            <div
                                key={m.name + m.position}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: `6px ${24 + depth * 16}px`,
                                    gap: 8,
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <Avatar size={28} icon={<UserOutlined />} style={{ background: 'var(--primary)', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.position} · {m.dept}</div>
                                </div>
                            </div>
                        ))}
                        {dept.children?.map(c => renderDept(c, depth + 1))}
                    </>
                )}
            </div>
        );
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 16,
            left: 76,
            width: 320,
            height: 460,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
        }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
            }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>조직도</span>
                <CloseOutlined
                    style={{ fontSize: 14, color: '#999', cursor: 'pointer' }}
                    onClick={onClose}
                />
            </div>

            {/* 검색 */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                <Input
                    placeholder="이름, 부서 검색"
                    prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                    size="small"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </div>

            {/* 트리 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
                {orgData.map(d => renderDept(d))}
            </div>
        </div>
    );
};

export default OrgChartPopup;
