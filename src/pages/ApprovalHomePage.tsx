import React, { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { approvalApi } from '../api/approvalApi';
import { approvalSubMenu } from '../layouts/menuConfig';
import { useResponsive } from '../hooks/useResponsive';

type RowItem = {
    key: string;
    id: string;
    title: string;
    author: string;
    status: string;
    date: string;
    dept: string;
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', label: 'Pending' },
    APPROVED: { bg: 'var(--status-done-bg)', text: 'var(--status-done-text)', label: 'Approved' },
    REJECTED: { bg: 'var(--status-reject-bg)', text: 'var(--status-reject-text)', label: 'Rejected' },
    DRAFT: { bg: 'var(--status-draft-bg)', text: 'var(--status-draft-text)', label: 'Draft' },
    CANCELLED: { bg: '#d9d9d9', text: '#555', label: 'Cancelled' },
};

const ApprovalHomePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { folder, deptId } = useParams();
    const { isMobile } = useResponsive();

    const [data, setData] = useState<RowItem[]>([]);
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

        if (path.includes('/reference')) return 'Reference Documents';
        if (path.includes('/planned')) return 'Planned Documents';
        if (path.includes('/received')) return 'Received Documents';
        if (path.includes('/personal/')) return `Personal Folder - ${folder}`;
        if (path.includes('/dept/')) return `Department Folder - ${folder}`;
        return 'Pending Documents';
    };

    const fetchData = async (currentPage = 1) => {
        try {
            setLoading(true);
            const path = location.pathname;
            let res;

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
            setData(
                content.map((item: any) => ({
                    key: String(item.id),
                    id: item.docNo || 'Temporary',
                    title: item.title,
                    author: item.submitter.name,
                    status: item.status,
                    date: dayjs(item.submittedAt || Date.now()).format('YYYY-MM-DD'),
                    dept: item.submitter.departmentName,
                })),
            );
            setTotal(totalElements);
        } catch (error) {
            console.error(error);
            message.error('Failed to load approval documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchData(1);
    }, [location.pathname, folder, deptId]);

    const columns: ColumnsType<RowItem> = [
        {
            title: 'Doc No',
            dataIndex: 'id',
            key: 'id',
            width: 130,
            render: (text, record) => (
                <a onClick={() => navigate(`/approval/${record.key}`)} style={{ color: 'var(--primary)' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
            width: 100,
        },
        {
            title: 'Department',
            dataIndex: 'dept',
            key: 'dept',
            width: 110,
            responsive: ['md'],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 96,
            render: (status) => {
                const cfg = statusConfig[status] || { bg: '#f0f0f0', text: '#555', label: status };

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
                        {cfg.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            responsive: ['md'],
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 16,
                }}
            >
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {getPageTitle()}
                </h2>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                size="small"
                scroll={{ x: isMobile ? 640 : undefined }}
                pagination={{
                    current: page,
                    pageSize: 10,
                    total,
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                    onChange: (nextPage) => {
                        setPage(nextPage);
                        fetchData(nextPage);
                    },
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
