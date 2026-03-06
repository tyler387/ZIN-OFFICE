import React from 'react';
import { Card, Descriptions, Tag, Steps, Button, Space, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const ApprovalDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    결재 상세 - AP-2026-00{id}
                </h2>
                <Button onClick={() => navigate(-1)}>목록으로</Button>
            </div>

            <Card style={{ borderRadius: 6, marginBottom: 16 }}>
                <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="문서번호">AP-2026-00{id}</Descriptions.Item>
                    <Descriptions.Item label="상태">
                        <Tag style={{ background: 'var(--status-pending-bg)', color: 'var(--status-pending-text)', border: 'none', borderRadius: 4 }}>
                            진행
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="기안자">김철수</Descriptions.Item>
                    <Descriptions.Item label="부서">개발팀</Descriptions.Item>
                    <Descriptions.Item label="기안일">2026-03-05</Descriptions.Item>
                    <Descriptions.Item label="양식">출장 경비 신청</Descriptions.Item>
                    <Descriptions.Item label="제목" span={2}>출장 경비 신청</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="결재선" style={{ borderRadius: 6, marginBottom: 16 }}>
                <Steps
                    size="small"
                    current={1}
                    items={[
                        { title: '기안', description: '김철수' },
                        { title: '팀장 결재', description: '박민수 (대기중)' },
                        { title: '부서장 결재', description: '이영희' },
                        { title: '최종 승인', description: '최지연' },
                    ]}
                />
            </Card>

            <Card title="본문 내용" style={{ borderRadius: 6, marginBottom: 16 }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    2026년 3월 서울 → 부산 출장에 따른 경비를 신청합니다.
                </p>
                <Divider />
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    첨부파일: 없음
                </p>
            </Card>

            <Space>
                <Button type="primary">승인</Button>
                <Button danger>반려</Button>
            </Space>
        </div>
    );
};

export default ApprovalDetailPage;
