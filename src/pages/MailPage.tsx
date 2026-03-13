import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    DeleteOutlined,
    FolderOutlined,
    MailOutlined,
    PaperClipOutlined,
    ReloadOutlined,
    StarFilled,
    StarOutlined,
} from '@ant-design/icons';
import { useResponsive } from '../hooks/useResponsive';

const folderNameMap: Record<string, string> = {
    important: '중요 메일함',
    inbox: '받은 메일함',
    unread: '읽지 않은 메일',
    today: '오늘 온 메일함',
    archive: '보관 메일함',
    sent: '보낸 메일함',
    draft: '임시보관함',
    scheduled: '예약 메일함',
    spam: '스팸 메일함',
    trash: '휴지통',
    'server-error': '서버 오류 메일함',
    'server-error-mail': '서버 오류 메일',
    yesterday: '어제 온 메일함',
    read: '읽은 메일함',
    attachment: '첨부 메일함',
    replied: '답장한 메일함',
    mine: '내가 쓴 메일함',
};

type MailItem = {
    key: string;
    starred: boolean;
    from: string;
    subject: string;
    date: string;
    unread: boolean;
    hasAttachment: boolean;
};

const inboxMails: MailItem[] = [
    { key: '1', starred: true, from: '김대리', subject: '프로젝트 일정 검토 요청', date: '10:32', unread: true, hasAttachment: false },
    { key: '2', starred: false, from: '이과장', subject: '주간 보고서 검토 부탁드립니다', date: '09:15', unread: true, hasAttachment: true },
    { key: '3', starred: false, from: '박주임', subject: 'RE: 서버 증설 요청', date: '어제', unread: false, hasAttachment: false },
    { key: '4', starred: true, from: '최사원', subject: '교육 신청 확인', date: '어제', unread: false, hasAttachment: true },
    { key: '5', starred: false, from: '강대리', subject: '제안서 초안 공유', date: '03/03', unread: false, hasAttachment: true },
];

const sentMails: MailItem[] = [
    { key: 's1', starred: false, from: '팀장', subject: 'RE: 프로젝트 일정 회신', date: '10:45', unread: false, hasAttachment: false },
    { key: 's2', starred: false, from: '개발팀', subject: '스프린트 계획 공유', date: '09:30', unread: false, hasAttachment: true },
];

const importantMails = inboxMails.filter((mail) => mail.starred);
const unreadMails = inboxMails.filter((mail) => mail.unread);
const attachmentMails = inboxMails.filter((mail) => mail.hasAttachment);
const readMails = inboxMails.filter((mail) => !mail.unread);

function getMailsForFolder(folder: string): MailItem[] {
    switch (folder) {
        case 'sent':
        case 'mine':
            return sentMails;
        case 'important':
            return importantMails;
        case 'unread':
            return unreadMails;
        case 'attachment':
            return attachmentMails;
        case 'read':
            return readMails;
        default:
            return inboxMails;
    }
}

const MailPage: React.FC = () => {
    const { folder } = useParams<{ folder: string }>();
    const currentFolder = folder || 'inbox';
    const folderName = folderNameMap[currentFolder] || '받은 메일함';
    const mails = getMailsForFolder(currentFolder);
    const navigate = useNavigate();
    const { isMobile } = useResponsive();

    const columns: ColumnsType<MailItem> = [
        {
            title: '',
            dataIndex: 'starred',
            key: 'starred',
            width: 40,
            render: (starred: boolean) =>
                starred ? (
                    <StarFilled style={{ color: '#FAAD14', fontSize: 14, cursor: 'pointer' }} />
                ) : (
                    <StarOutlined style={{ color: '#d9d9d9', fontSize: 14, cursor: 'pointer' }} />
                ),
        },
        {
            title: currentFolder === 'sent' || currentFolder === 'mine' ? '받는 사람' : '보낸 사람',
            dataIndex: 'from',
            key: 'from',
            width: isMobile ? 110 : 140,
            render: (text: string, record: MailItem) => (
                <span style={{ fontWeight: record.unread ? 600 : 400 }}>{text}</span>
            ),
        },
        {
            title: '제목',
            dataIndex: 'subject',
            key: 'subject',
            ellipsis: true,
            render: (text: string, record: MailItem) => (
                <span style={{ fontWeight: record.unread ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {text}
                    {record.hasAttachment && <PaperClipOutlined style={{ color: '#999', fontSize: 12, flexShrink: 0 }} />}
                </span>
            ),
        },
        {
            title: '날짜',
            dataIndex: 'date',
            key: 'date',
            width: 100,
            responsive: ['md'],
            render: (text: string) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{text}</span>,
        },
    ];

    return (
        <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                {folderName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Checkbox />
                <Button size="small" icon={<ReloadOutlined />}>새로고침</Button>
                <Button size="small" icon={<DeleteOutlined />}>삭제</Button>
                <Button size="small" icon={<FolderOutlined />}>이동</Button>
                <Button size="small" icon={<MailOutlined />}>읽음</Button>
                <div style={{ flex: 1, minWidth: isMobile ? '100%' : 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: isMobile ? '100%' : 'auto' }}>
                    총 {mails.length}건
                    {mails.some((mail) => mail.unread) && ` / 안 읽음 ${mails.filter((mail) => mail.unread).length}건`}
                </span>
            </div>

            <Table
                columns={columns}
                dataSource={mails}
                size="small"
                scroll={{ x: isMobile ? 560 : undefined }}
                pagination={mails.length > 20 ? { pageSize: 20, showSizeChanger: false, position: ['bottomCenter'] as const } : false}
                locale={{ emptyText: '메일이 없습니다.' }}
                onRow={(record) => ({
                    style: {
                        height: 40,
                        cursor: 'pointer',
                        background: record.unread ? '#FAFFFE' : 'transparent',
                    },
                    onClick: () => navigate(`/mail/${currentFolder}/${record.key}`),
                })}
            />
        </div>
    );
};

export default MailPage;
