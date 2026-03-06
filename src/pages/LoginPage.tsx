import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage: React.FC = () => {
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #00695C 0%, #00897B 50%, #4DB6AC 100%)',
            }}
        >
            <Card
                style={{
                    width: 380,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            background: 'var(--primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                        }}
                    >
                        <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>GW</span>
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        사내 그룹웨어
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        로그인하여 시작하세요
                    </p>
                </div>

                <Form layout="vertical" size="large">
                    <Form.Item>
                        <Input prefix={<UserOutlined />} placeholder="아이디" />
                    </Form.Item>
                    <Form.Item>
                        <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ height: 44, fontWeight: 600 }}>
                            로그인
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    © 2026 ZIN Corporation. All rights reserved.
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
