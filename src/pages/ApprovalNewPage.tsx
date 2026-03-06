import React from 'react';
import { Card, Form, Input, Select, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const ApprovalNewPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
                새 결재 작성
            </h2>

            <Card style={{ borderRadius: 6 }}>
                <Form layout="vertical" style={{ maxWidth: 700 }}>
                    <Form.Item label="결재 양식" required>
                        <Select
                            placeholder="양식을 선택해주세요"
                            options={[
                                { value: 'expense', label: '출장 경비 신청' },
                                { value: 'vacation', label: '연차 휴가 신청' },
                                { value: 'purchase', label: '물품 구매 요청서' },
                                { value: 'wfh', label: '재택근무 신청' },
                                { value: 'budget', label: '예산 변경 요청' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item label="제목" required>
                        <Input placeholder="제목을 입력해주세요" />
                    </Form.Item>

                    <Form.Item label="내용">
                        <Input.TextArea rows={8} placeholder="내용을 입력해주세요" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary">상신</Button>
                            <Button>임시 저장</Button>
                            <Button onClick={() => navigate(-1)}>취소</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ApprovalNewPage;
