import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RightOutlined, DownOutlined, PlusOutlined, CalendarOutlined, StarOutlined, GlobalOutlined } from '@ant-design/icons';

const CalendarSubMenu: React.FC = () => {
    const [myCalOpen, setMyCalOpen] = useState(true);
    const [favCalOpen, setFavCalOpen] = useState(true);
    const [companyCalOpen, setCompanyCalOpen] = useState(true);
    const navigate = useNavigate();

    const sectionHeaderStyle: React.CSSProperties = {
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#666',
        cursor: 'pointer',
        letterSpacing: 0.3,
        userSelect: 'none',
    };

    const checkItemStyle: React.CSSProperties = {
        height: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 28px',
        fontSize: 13,
        color: 'var(--submenu-item)',
        cursor: 'pointer',
        gap: 8,
        transition: 'background 0.12s',
    };

    const ColorDot: React.FC<{ color: string }> = ({ color }) => (
        <span style={{
            width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0,
        }} />
    );

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 일정 추가 버튼 */}
            <div style={{ padding: '10px 12px' }}>
                <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    style={{ height: 36, fontWeight: 600, fontSize: 13 }}
                    onClick={() => navigate('/calendar')}
                >
                    일정 추가
                </Button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* 내 캘린더 */}
                <div style={sectionHeaderStyle} onClick={() => setMyCalOpen(!myCalOpen)}>
                    {myCalOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <CalendarOutlined style={{ fontSize: 12, marginRight: 4, color: 'var(--primary)' }} />
                    <span style={{ flex: 1 }}>내 캘린더</span>
                </div>
                {myCalOpen && (
                    <>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#4CAF50' }} />
                            <ColorDot color="#4CAF50" />
                            <span>개인 일정</span>
                        </div>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#2196F3' }} />
                            <ColorDot color="#2196F3" />
                            <span>업무 일정</span>
                        </div>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#FF9800' }} />
                            <ColorDot color="#FF9800" />
                            <span>미팅</span>
                        </div>
                    </>
                )}

                {/* 관심 캘린더 */}
                <div style={{ ...sectionHeaderStyle, marginTop: 4 }} onClick={() => setFavCalOpen(!favCalOpen)}>
                    {favCalOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <StarOutlined style={{ fontSize: 12, marginRight: 4, color: '#FAAD14' }} />
                    <span style={{ flex: 1 }}>관심 캘린더</span>
                    <PlusOutlined style={{ fontSize: 11, color: '#999', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); }} />
                </div>
                {favCalOpen && (
                    <>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#9C27B0' }} />
                            <ColorDot color="#9C27B0" />
                            <span>김철수 (개발팀)</span>
                        </div>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#E91E63' }} />
                            <ColorDot color="#E91E63" />
                            <span>이영희 (마케팅팀)</span>
                        </div>
                    </>
                )}

                {/* 전사일정 */}
                <div style={{ ...sectionHeaderStyle, marginTop: 4 }} onClick={() => setCompanyCalOpen(!companyCalOpen)}>
                    {companyCalOpen ? <DownOutlined style={{ fontSize: 9, marginRight: 4 }} /> : <RightOutlined style={{ fontSize: 9, marginRight: 4 }} />}
                    <GlobalOutlined style={{ fontSize: 12, marginRight: 4, color: '#1890FF' }} />
                    <span style={{ flex: 1 }}>전사일정</span>
                </div>
                {companyCalOpen && (
                    <>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#F44336' }} />
                            <ColorDot color="#F44336" />
                            <span>공휴일</span>
                        </div>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#00BCD4' }} />
                            <ColorDot color="#00BCD4" />
                            <span>회사 행사</span>
                        </div>
                        <div style={checkItemStyle}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <input type="checkbox" defaultChecked style={{ accentColor: '#607D8B' }} />
                            <ColorDot color="#607D8B" />
                            <span>교육/세미나</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalendarSubMenu;
