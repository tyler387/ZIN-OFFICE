import React, { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { approvalApi } from '../api/approvalApi';
import { approvalSubMenu } from '../layouts/menuConfig';
import dayjs from 'dayjs';

const statusConfig: Record<string, { bg: string; text: string }> = {
    'PENDING': { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' },
    'APPROVED': { bg: 'var(--status-done-bg)', text: 'var(--status-done-text)' },
    'REJECTED': { bg: 'var(--status-reject-bg)', text: 'var(--status-reject-text)' },
    'DRAFT': { bg: 'var(--status-draft-bg)', text: 'var(--status-draft-text)' },
    'CANCELLED': { bg: '#d9d9d9', text: '#555' },
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'PENDING': return '진행';
        case 'APPROVED': return '완료';
        case 'REJECTED': return '반려';
        case 'DRAFT': return '임시저장';
        case 'CANCELLED': return '취소됨';
        default: return status;
    }
};

const ApprovalHomePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { folder, deptId } = useParams();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const getPageTitle = () => {
        const path = location.pathname;

        for (const section of approvalSubMenu) {
            for (const item of section.items) {
                if (item.path === path) {
                    return item.label.replace(/[<>]/g, '');
                }
            }
        }

        if (path.includes('/reference')) return '참조/열람 대기 문서';
        if (path.includes('/planned')) return '결재 예정 문서';
        if (path.includes('/received')) return '결재 수신 문서';
        if (path.includes('/personal/')) return `개인 문서함 - ${folder}`;
        if (path.includes('/dept/')) return `부서 문서함 - ${folder}`;
        return '결재 대기 문서';
    };

    const fetchData = async (currentPage = 1) => {
        try {
            setLoading(true);
            const path = location.pathname;
            let res;

            // page is 0-indexed for backend API
            if (path.includes('/reference')) {
                res = await approvalApi.getReferenceList(currentPage - 1, 10);
            } else if (path.includes('/planned')) {
                res = await approvalApi.getPlannedList(currentPage - 1, 10);
            } else if (path.includes('/received')) {
                res = await approvalApi.getPendingList(currentPage - 1, 10);
            } else if (path.includes('/personal/')) {
                res = await approvalApi.getPersonalDocs(folder || 'default', currentPage - 1);
            } else if (path.includes('/dept/')) {
                res = await approvalApi.getDeptDocs(deptId || '', folder || 'default', currentPage - 1);
            } else {
                res = await approvalApi.getPendingList(currentPage - 1, 10);
            }

            const { content, totalElements } = res.data;
            setData(content.map((item: any) => ({
                key: item.id,
                id: item.docNo || '임시문서',
                title: item.title,
                author: item.submitter.name,
                status: item.status,
                date: dayjs(item.submittedAt || Date.now()).format('YYYY-MM-DD'),
                dept: item.submitter.departmentName
            })));
            setTotal(totalElements);
        } catch (error) {
            message.error('목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset page on route change
        fetchData(1);
    }, [location.pathname, folder, deptId]);

    const columns = [
        {
            title: '문서번호',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            render: (text: string, record: any) => (
                <a onClick={() => navigate(`/approval/${record.key}`)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                    {text}
                </a>
            ),
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: '기안자',
            dataIndex: 'author',
            key: 'author',
            width: 100,
        },
        {
            title: '부서',
            dataIndex: 'dept',
            key: 'dept',
            width: 100,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            render: (status: string) => {
                const cfg = statusConfig[status] || { bg: '#f0f0f0', text: '#555' };
                return (
                    <Tag
                        style={{
                            background: cfg.bg,
                            color: cfg.text,
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 12,
                        }}
                    >
                        {getStatusText(status)}
                    </Tag>
                );
            },
        },
        {
            title: '기안일',
            dataIndex: 'date',
            key: 'date',
            width: 110,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {getPageTitle()}
                </h2>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                size="small"
                pagination={{
                    current: page,
                    pageSize: 10,
                    total: total,
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                    onChange: (p) => {
                        setPage(p);
                        fetchData(p);
                    }
                }}
                style={{ borderRadius: 6, overflow: 'hidden' }}
                onRow={(record) => ({
                    style: { height: 40, cursor: 'pointer' },
                    onClick: () => navigate(`/approval/${record.key}`),
                })}
            />
        </div>
    );
};

export default ApprovalHomePage;
