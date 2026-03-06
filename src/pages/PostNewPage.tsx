import React from 'react';
import { Card, Form, Input, Button, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

const PostNewPage: React.FC = () => {
    const navigate = useNavigate();
    const { boardId } = useParams();

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
                새 글 작성
            </h2>
            <Card style={{ borderRadius: 6 }}>
                <Form layout="vertical" style={{ maxWidth: 700 }}>
                    <Form.Item label="제목" required>
                        <Input placeholder="제목을 입력해주세요" />
                    </Form.Item>
                    <Form.Item label="내용">
                        <Input.TextArea rows={10} placeholder="내용을 입력해주세요" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary">등록</Button>
                            <Button onClick={() => navigate(-1)}>취소</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PostNewPage;
