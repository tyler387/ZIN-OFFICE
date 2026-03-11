import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Steps, Button, Space, message, Modal, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { approvalApi } from '../api/approvalApi';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';

// Types (could be moved to a types file, but keeping inline for simplicity)
interface ApprovalDetail {
    id: number;
    docNo: string;
    formType: string;
    title: string;
    content: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    isUrgent: boolean;
    submitter: { name: string; departmentName: string; position: string };
    submittedAt: string;
    completedAt: string;
    approvalLines: Array<{
        step: number;
        type: 'APPROVE' | 'REVIEW' | 'CC';
        approver: { name: string; position: string };
        status: 'WAITING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
        comment: string;
        processedAt: string;
    }>;
}

const ApprovalDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [detail, setDetail] = useState<ApprovalDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [rejectVisible, setRejectVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveVisible, setApproveVisible] = useState(false);
    const [approveComment, setApproveComment] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await approvalApi.getDetail(id!);
            const data: ApprovalDetail = res.data;
            setDetail(data);

            // If I am a CC, call view API
            if (user) {
                // Just calling view API if it's pending/approved. Safely ignore errors.
                approvalApi.view(id!).catch(() => { });
            }
        } catch (error) {
            message.error('결재 문서를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, user]);

    const handleApprove = async () => {
        try {
            await approvalApi.approve(id!, approveComment);
            message.success('승인 처리되었습니다.');
            setApproveVisible(false);
            fetchData();
        } catch (error) {
            message.error('승인 처리에 실패했습니다.');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            message.warning('반려 사유를 입력해주세요.');
            return;
        }
        try {
            await approvalApi.reject(id!, rejectReason);
            message.success('반려 처리되었습니다.');
            setRejectVisible(false);
            fetchData();
        } catch (error) {
            message.error('반려 처리에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        Modal.confirm({
            title: '결재 취소',
            content: '정말 기안을 취소하시겠습니까?',
            onOk: async () => {
                try {
                    await approvalApi.cancel(id!);
                    message.success('기안이 취소되었습니다.');
                    fetchData();
                } catch (error) {
                    message.error('취소에 실패했습니다.');
                }
            }
        });
    };

    const handleResubmit = async () => {
        if (!detail) return;
        Modal.confirm({
            title: '재기안',
            content: '이 내용을 바탕으로 다시 기안하시겠습니까?',
            onOk: async () => {
                try {
                    const res = await approvalApi.resubmit(id!, {
                        formType: detail.formType,
                        title: detail.title,
                        content: detail.content,
                    });
                    message.success('재기안 되었습니다.');
                    navigate(`/approval/${res.data.id}`);
                } catch (error) {
                    message.error('재기안에 실패했습니다.');
                }
            }
        });
    };

    if (loading || !detail) {
        return <div style={{ padding: 24 }}>로딩 중...</div>;
    }

    // Determine current user roles
    // We check against position to loosely ensure it detects properly
    const isSubmitter = user?.name === detail.submitter.name;

    // Check if current user is an active approver
    const pendingLines = detail.approvalLines.filter(l => l.status === 'WAITING' && l.type !== 'CC');
    const currentStepNum = pendingLines.length > 0 ? Math.min(...pendingLines.map(l => l.step)) : -1;
    const isCurrentApprover = pendingLines.some(l => l.step === currentStepNum && l.approver.name === user?.name);

    // Map Approval Lines to Steps items
    const stepItems = detail.approvalLines
        .filter(l => l.type !== 'CC') // usually steps exclude CC
        .sort((a, b) => a.step - b.step)
        .map((l, idx) => {
            let status: 'wait' | 'process' | 'finish' | 'error' = 'wait';
            if (l.status === 'APPROVED') status = 'finish';
            else if (l.status === 'REJECTED') status = 'error';
            else if (detail.status === 'PENDING' && l.step === currentStepNum) status = 'process';

            return {
                key: `step-${idx}`,
                title: l.type === 'REVIEW' ? '검토' : '결재',
                description: (
                    <div>
                        <div>{l.approver.name} {l.approver.position}</div>
                        {l.status === 'APPROVED' && <div style={{ color: 'green', fontSize: '0.85em', marginTop: 4 }}>승인<br />{dayjs(l.processedAt).format('MM-DD HH:mm')}</div>}
                        {l.status === 'REJECTED' && <div style={{ color: 'red', fontSize: '0.85em', marginTop: 4 }}>반려<br />({l.comment})</div>}
                    </div>
                ),
                status
            };
        });

    // Add draft step at the beginning
    const stepsData = [
        {
            key: 'submitter',
            title: '기안',
            status: 'finish' as const,
            description: (
                <div>
                    <div>{detail.submitter.name} {detail.submitter.position}</div>
                    <div style={{ color: 'gray', fontSize: '0.85em', marginTop: 4 }}>상신됨<br />{dayjs(detail.submittedAt).format('MM-DD HH:mm')}</div>
                </div>
            )
        },
        ...stepItems
    ];

    const StatusTag = () => {
        let color = '#108ee9';
        let text = '진행';
        if (detail.status === 'APPROVED') { color = '#87d068'; text = '완료'; }
        if (detail.status === 'REJECTED') { color = '#f50'; text = '반려'; }
        if (detail.status === 'CANCELLED') { color = '#d9d9d9'; text = '취소됨'; }
        if (detail.status === 'DRAFT') { color = 'orange'; text = '임시저장'; }

        return <Tag color={color}>{text}</Tag>;
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    결재 상세 - {detail.docNo || '임시문서'}
                </h2>
                <Button onClick={() => navigate(-1)}>목록으로</Button>
            </div>

            <Card style={{ borderRadius: 6, marginBottom: 16 }} bodyStyle={{ padding: 12 }}>
                <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="문서번호">{detail.docNo || '-'}</Descriptions.Item>
                    <Descriptions.Item label="상태"><StatusTag /></Descriptions.Item>
                    <Descriptions.Item label="기안자">{detail.submitter.name} {detail.submitter.position}</Descriptions.Item>
                    <Descriptions.Item label="부서">{detail.submitter.departmentName}</Descriptions.Item>
                    <Descriptions.Item label="기안일">{detail.submittedAt ? dayjs(detail.submittedAt).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="양식">{detail.formType}</Descriptions.Item>
                    <Descriptions.Item label="제목" span={2}>
                        {detail.isUrgent && <Tag color="red">긴급</Tag>}
                        {detail.title}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="결재선" style={{ borderRadius: 6, marginBottom: 16 }}>
                <Steps
                    size="small"
                    items={stepsData}
                />
            </Card>

            <Card title="본문 내용" style={{ borderRadius: 6, marginBottom: 16 }}>
                <div
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: detail.content || '<p>내용이 없습니다.</p>' }}
                />
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Space size="middle">
                    {/* Approver actions */}
                    {detail.status === 'PENDING' && isCurrentApprover && (
                        <>
                            <Button type="primary" size="large" onClick={() => setApproveVisible(true)}>결재 승인</Button>
                            <Button danger size="large" onClick={() => setRejectVisible(true)}>결재 반려</Button>
                        </>
                    )}

                    {/* Submitter actions */}
                    {detail.status === 'PENDING' && isSubmitter && (
                        <Button danger onClick={handleCancel}>결재 취소</Button>
                    )}

                    {detail.status === 'REJECTED' && isSubmitter && (
                        <Button type="primary" onClick={handleResubmit}>재기안</Button>
                    )}
                </Space>
            </div>

            {/* Approval Modal */}
            <Modal
                title="결재 승인"
                open={approveVisible}
                onOk={handleApprove}
                onCancel={() => setApproveVisible(false)}
            >
                <div style={{ marginBottom: 8 }}>의견 (선택사항)</div>
                <Input.TextArea
                    rows={4}
                    value={approveComment}
                    onChange={e => setApproveComment(e.target.value)}
                    placeholder="결재 승인 의견을 입력하세요."
                />
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="결재 반려"
                open={rejectVisible}
                onOk={handleReject}
                onCancel={() => setRejectVisible(false)}
                okButtonProps={{ danger: true }}
                okText="반려"
            >
                <div style={{ marginBottom: 8 }}>반려 사유 (필수)</div>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요."
                />
            </Modal>
        </div>
    );
};

export default ApprovalDetailPage;
