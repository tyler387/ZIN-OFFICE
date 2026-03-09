import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const res = await authApi.login(values.email, values.password);

            if (res.data.success) {
                const { accessToken, refreshToken, user } = res.data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                setUser(user);

                message.success('로그인 성공!');
                navigate('/home');
            } else {
                message.error(res.data.message || '로그인에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

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

                <Form layout="vertical" size="large" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="이메일 (ex: admin@company.com)" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="비밀번호 (ex: password123)" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600 }}>
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
