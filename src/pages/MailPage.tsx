import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Checkbox } from 'antd';
import {
    ReloadOutlined,
    DeleteOutlined,
    FolderOutlined,
    MailOutlined,
    PaperClipOutlined,
    StarOutlined,
    StarFilled,
} from '@ant-design/icons';

/* ─── 메일함별 이름 매핑 ─── */
const folderNameMap: Record<string, string> = {
    important: '중요메일함',
    inbox: '받은메일함',
    unread: '안읽은메일함',
    today: '오늘온메일함',
    archive: '보관 메일함',
    sent: '보낸메일함',
    draft: '임시보관함',
    scheduled: '예약메일함',
    spam: '스팸메일함',
    trash: '휴지통',
    'server-error': '서버 오류 메일함',
    'server-error-mail': '서버 오류 메일',
    yesterday: '어제온메일함',
    read: '읽은메일함',
    attachment: '첨부메일함',
    replied: '답장한메일함',
    mine: '내가쓴메일함',
};

/* ─── 메일함별 더미 데이터 ─── */
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
    { key: '1', starred: true, from: '김철수', subject: '프로젝트 일정 관련 회의 요청드립니다', date: '10:32', unread: true, hasAttachment: false },
    { key: '2', starred: false, from: '이영희', subject: '주간 보고서 검토 요청', date: '09:15', unread: true, hasAttachment: true },
    { key: '3', starred: false, from: '박민수', subject: 'Re: 서버 증설 요청 건 - 검토 결과 공유', date: '어제', unread: false, hasAttachment: false },
    { key: '4', starred: true, from: '최지연', subject: '외부 교육 신청서 확인 부탁드립니다', date: '어제', unread: false, hasAttachment: true },
    { key: '5', starred: false, from: '강서연', subject: '디자인 시안 공유합니다', date: '03/03', unread: false, hasAttachment: true },
    { key: '6', starred: false, from: '시스템 알림', subject: '[자동] 비밀번호 변경 안내', date: '03/03', unread: false, hasAttachment: false },
    { key: '7', starred: false, from: '정호진', subject: '법인카드 사용 내역 정리', date: '03/02', unread: false, hasAttachment: true },
    { key: '8', starred: false, from: '인사팀', subject: '2026년 상반기 교육 일정 안내', date: '03/01', unread: false, hasAttachment: false },
    { key: '9', starred: false, from: '김철수', subject: 'Re: 코드 리뷰 요청', date: '03/01', unread: false, hasAttachment: false },
    { key: '10', starred: false, from: '보안팀', subject: '[필독] 보안 패치 적용 안내', date: '02/28', unread: true, hasAttachment: false },
];

const sentMails: MailItem[] = [
    { key: 's1', starred: false, from: '나 → 김철수', subject: 'Re: 프로젝트 일정 관련 회의 회신', date: '10:45', unread: false, hasAttachment: false },
    { key: 's2', starred: false, from: '나 → 개발팀', subject: '3월 스프린트 계획서 공유', date: '09:30', unread: false, hasAttachment: true },
    { key: 's3', starred: true, from: '나 → 이영희', subject: '주간 보고서 수정본 전달', date: '어제', unread: false, hasAttachment: true },
    { key: 's4', starred: false, from: '나 → 인사팀', subject: '연차 사용 확인 요청', date: '어제', unread: false, hasAttachment: false },
    { key: 's5', starred: false, from: '나 → 보안팀', subject: 'VPN 설정 문의', date: '03/03', unread: false, hasAttachment: false },
];

const importantMails: MailItem[] = [
    { key: 'i1', starred: true, from: '김철수', subject: '프로젝트 일정 관련 회의 요청드립니다', date: '10:32', unread: true, hasAttachment: false },
    { key: 'i2', starred: true, from: '최지연', subject: '외부 교육 신청서 확인 부탁드립니다', date: '어제', unread: false, hasAttachment: true },
    { key: 'i3', starred: true, from: 'CTO', subject: '2026 기술 전략 방향 공유', date: '03/02', unread: false, hasAttachment: true },
    { key: 'i4', starred: true, from: '인사팀', subject: '승진 심사 관련 안내', date: '03/01', unread: false, hasAttachment: false },
];

const spamMails: MailItem[] = [
    { key: 'sp1', starred: false, from: 'promo@shop.com', subject: '[광고] 봄맞이 특가 세일 70% 할인!', date: '10:01', unread: false, hasAttachment: false },
    { key: 'sp2', starred: false, from: 'alert@unknown.net', subject: '계정 확인이 필요합니다', date: '어제', unread: false, hasAttachment: false },
    { key: 'sp3', starred: false, from: 'info@bulk.co', subject: '무료 이벤트 당첨 안내', date: '03/03', unread: false, hasAttachment: false },
];

const draftMails: MailItem[] = [
    { key: 'd1', starred: false, from: '(임시저장)', subject: '프로젝트 예산 변경 요청서', date: '09:50', unread: false, hasAttachment: false },
    { key: 'd2', starred: false, from: '(임시저장)', subject: '팀 회식 장소 공유', date: '어제', unread: false, hasAttachment: false },
];

const trashMails: MailItem[] = [
    { key: 't1', starred: false, from: '마케팅팀', subject: '지난달 뉴스레터', date: '03/01', unread: false, hasAttachment: false },
    { key: 't2', starred: false, from: '외부 발송', subject: '세미나 참가 확인', date: '02/28', unread: false, hasAttachment: true },
    { key: 't3', starred: false, from: '시스템', subject: '오래된 임시 메일 삭제 안내', date: '02/25', unread: false, hasAttachment: false },
];

const archiveMails: MailItem[] = [
    { key: 'a1', starred: false, from: '개발팀', subject: '2025년 4분기 회고 문서', date: '01/15', unread: false, hasAttachment: true },
    { key: 'a2', starred: true, from: '기획팀', subject: '연간 로드맵 최종본', date: '01/10', unread: false, hasAttachment: true },
    { key: 'a3', starred: false, from: 'CTO', subject: '조직 개편 안내', date: '01/05', unread: false, hasAttachment: false },
];

const todayMails: MailItem[] = [
    { key: 'td1', starred: true, from: '김철수', subject: '프로젝트 일정 관련 회의 요청드립니다', date: '10:32', unread: true, hasAttachment: false },
    { key: 'td2', starred: false, from: '이영희', subject: '주간 보고서 검토 요청', date: '09:15', unread: true, hasAttachment: true },
];

const unreadMails: MailItem[] = inboxMails.filter(m => m.unread);

const scheduledMails: MailItem[] = [
    { key: 'sc1', starred: false, from: '나 → 영업팀', subject: '2026 Q2 실적 보고서 (예약 발송)', date: '03/10 09:00', unread: false, hasAttachment: true },
    { key: 'sc2', starred: false, from: '나 → 전체', subject: '3월 정기 공지사항 (예약 발송)', date: '03/07 08:00', unread: false, hasAttachment: false },
];

const serverErrorMails: MailItem[] = [
    { key: 'se1', starred: false, from: '배송 반송', subject: 'Undelivered Mail: user@invalid.com', date: '03/04', unread: false, hasAttachment: false },
    { key: 'se2', starred: false, from: '배송 반송', subject: 'Delivery Failure: test@fail.net', date: '03/02', unread: false, hasAttachment: false },
];

const repliedMails: MailItem[] = [
    { key: 'r1', starred: false, from: '김철수', subject: 'Re: 프로젝트 일정 관련 회의 요청', date: '10:45', unread: false, hasAttachment: false },
    { key: 'r2', starred: false, from: '박민수', subject: 'Re: 서버 증설 요청 건', date: '어제', unread: false, hasAttachment: false },
];

const attachmentMails: MailItem[] = inboxMails.filter(m => m.hasAttachment);

const yesterdayMails: MailItem[] = inboxMails.filter(m => m.date === '어제');

const readMails: MailItem[] = inboxMails.filter(m => !m.unread);

const mineMails: MailItem[] = sentMails;

function getMailsForFolder(folder: string): MailItem[] {
    switch (folder) {
        case 'inbox': return inboxMails;
        case 'sent': return sentMails;
        case 'important': return importantMails;
        case 'spam': return spamMails;
        case 'draft': return draftMails;
        case 'trash': return trashMails;
        case 'archive': return archiveMails;
        case 'today': return todayMails;
        case 'unread': return unreadMails;
        case 'scheduled': return scheduledMails;
        case 'server-error': case 'server-error-mail': return serverErrorMails;
        case 'replied': return repliedMails;
        case 'attachment': return attachmentMails;
        case 'yesterday': return yesterdayMails;
        case 'read': return readMails;
        case 'mine': return mineMails;
        default: return inboxMails;
    }
}

const MailPage: React.FC = () => {
    const { folder } = useParams<{ folder: string }>();
    const currentFolder = folder || 'inbox';
    const folderName = folderNameMap[currentFolder] || '받은메일함';
    const mails = getMailsForFolder(currentFolder);
    const navigate = useNavigate();

    const columns = [
        {
            title: '',
            dataIndex: 'starred',
            key: 'starred',
            width: 36,
            render: (starred: boolean) =>
                starred
                    ? <StarFilled style={{ color: '#FAAD14', fontSize: 14, cursor: 'pointer' }} />
                    : <StarOutlined style={{ color: '#d9d9d9', fontSize: 14, cursor: 'pointer' }} />,
        },
        {
            title: currentFolder === 'sent' || currentFolder === 'mine' ? '받는 사람' : '보낸 사람',
            dataIndex: 'from',
            key: 'from',
            width: 140,
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
            render: (text: string) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{text}</span>,
        },
    ];

    return (
        <div>
            {/* 메일함 이름 헤더 */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                {folderName}
            </h2>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Checkbox />
                <Button size="small" icon={<ReloadOutlined />}>새로고침</Button>
                <Button size="small" icon={<DeleteOutlined />}>삭제</Button>
                <Button size="small" icon={<FolderOutlined />}>이동</Button>
                <Button size="small" icon={<MailOutlined />}>읽음</Button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    전체 {mails.length}건
                    {mails.some(m => m.unread) && ` · 안읽음 ${mails.filter(m => m.unread).length}건`}
                </span>
            </div>

            <Table
                columns={columns}
                dataSource={mails}
                size="small"
                pagination={mails.length > 20 ? { pageSize: 20, showSizeChanger: false, position: ['bottomCenter'] as const } : false}
                locale={{ emptyText: '메일이 없습니다' }}
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
