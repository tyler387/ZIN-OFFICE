import React from 'react';
import { Card, Button, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetailPage: React.FC = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    게시글 상세
                </h2>
                <Button onClick={() => navigate(-1)}>목록으로</Button>
            </div>
            <Card style={{ borderRadius: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>[공지] 2026년 3월 정기점검 안내</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    관리자 · 2026-03-05 · 조회 142
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    안녕하세요. 2026년 3월 정기점검 일정을 안내드립니다.<br />
                    일시: 2026년 3월 15일 (토) 02:00 ~ 06:00<br />
                    대상: 전 시스템<br />
                    점검 시간 동안 서비스 이용이 제한될 수 있습니다.
                </p>
            </Card>
        </div>
    );
};

export default PostDetailPage;
