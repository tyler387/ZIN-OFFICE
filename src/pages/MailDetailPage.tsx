import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    FolderOutlined,
    MailOutlined,
    StarOutlined,
    StarFilled,
    PrinterOutlined,
    DownloadOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';

/* ─── 메일 상세 더미 데이터 ─── */
type MailDetail = {
    id: string;
    subject: string;
    from: string;
    fromEmail: string;
    to: string;
    toEmail: string;
    cc?: string;
    date: string;
    starred: boolean;
    attachments: { name: string; size: string; type: string }[];
    content: string;
};

const mailDetailMap: Record<string, MailDetail> = {
    '1': {
        id: '1',
        subject: '프로젝트 일정 관련 회의 요청드립니다',
        from: '김철수',
        fromEmail: 'kim.cs@company.com',
        to: '홍길동',
        toEmail: 'hong@company.com',
        date: '2026-03-05 (수) 10:32',
        starred: true,
        attachments: [],
        content: `<p>안녕하세요, 홍길동님.</p>
<p>현재 진행 중인 <strong>그룹웨어 리뉴얼 프로젝트</strong>의 일정 관련하여 회의를 요청드립니다.</p>
<p>아래 안건을 사전에 검토해 주시면 감사하겠습니다:</p>
<ol>
<li>마일스톤 일정 재조정</li>
<li>디자인 리뷰 결과 반영 방안</li>
<li>QA 일정 확정</li>
</ol>
<p>일시: <strong>2026년 3월 7일 (금) 오후 2시</strong><br/>장소: <strong>회의실 A</strong></p>
<p>감사합니다.<br/>김철수 드림</p>`,
    },
    '2': {
        id: '2',
        subject: '주간 보고서 검토 요청',
        from: '이영희',
        fromEmail: 'lee.yh@company.com',
        to: '홍길동',
        toEmail: 'hong@company.com',
        date: '2026-03-05 (수) 09:15',
        starred: false,
        attachments: [
            { name: '주간보고서_3월1주차.xlsx', size: '245 KB', type: 'excel' },
            { name: '프로젝트_현황.pdf', size: '1.2 MB', type: 'pdf' },
        ],
        content: `<p>안녕하세요, 홍길동님.</p>
<p>이번 주 주간 보고서를 작성하여 첨부드립니다.</p>
<p>주요 사항:</p>
<ul>
<li>프론트엔드 UI 개발 진행률: 75%</li>
<li>백엔드 API 연동: 60% 완료</li>
<li>이슈: 인증 모듈 리팩토링 필요</li>
</ul>
<p>검토 후 피드백 부탁드립니다.</p>
<p>감사합니다.<br/>이영희</p>`,
    },
    '3': {
        id: '3',
        subject: 'Re: 서버 증설 요청 건 - 검토 결과 공유',
        from: '박민수',
        fromEmail: 'park.ms@company.com',
        to: '홍길동',
        toEmail: 'hong@company.com',
        cc: '인프라팀',
        date: '2026-03-04 (화) 16:42',
        starred: false,
        attachments: [],
        content: `<p>안녕하세요, 홍길동님.</p>
<p>요청하신 서버 증설 건에 대해 인프라팀과 협의한 결과를 공유드립니다.</p>
<p><strong>검토 결과:</strong></p>
<ul>
<li>현재 서버 CPU 사용률: 평균 78%</li>
<li>메모리 사용률: 평균 85%</li>
<li>증설 필요성: <span style="color: #FF4D4F; font-weight: bold;">긴급</span></li>
</ul>
<p>3월 15일 정기 점검 시 증설 작업을 진행할 예정입니다.</p>
<p>감사합니다.<br/>박민수</p>`,
    },
    '4': {
        id: '4',
        subject: '외부 교육 신청서 확인 부탁드립니다',
        from: '최지연',
        fromEmail: 'choi.jy@company.com',
        to: '홍길동',
        toEmail: 'hong@company.com',
        date: '2026-03-04 (화) 14:20',
        starred: true,
        attachments: [
            { name: '교육신청서_최지연.pdf', size: '320 KB', type: 'pdf' },
            { name: '교육과정_안내.png', size: '890 KB', type: 'image' },
        ],
        content: `<p>안녕하세요, 홍길동님.</p>
<p>아래 외부 교육 과정에 참가 신청을 하고자 합니다.</p>
<p><strong>교육 정보:</strong></p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="padding: 6px 12px; border: 1px solid #e8e8e8; background: #fafafa; font-weight: 500;">교육명</td><td style="padding: 6px 12px; border: 1px solid #e8e8e8;">React Advanced Patterns 교육</td></tr>
<tr><td style="padding: 6px 12px; border: 1px solid #e8e8e8; background: #fafafa; font-weight: 500;">기간</td><td style="padding: 6px 12px; border: 1px solid #e8e8e8;">2026.03.20 ~ 03.22 (3일)</td></tr>
<tr><td style="padding: 6px 12px; border: 1px solid #e8e8e8; background: #fafafa; font-weight: 500;">비용</td><td style="padding: 6px 12px; border: 1px solid #e8e8e8;">550,000원</td></tr>
</table>
<p style="margin-top: 12px;">첨부된 신청서 확인 및 승인 부탁드립니다.</p>
<p>감사합니다.<br/>최지연</p>`,
    },
};

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FilePdfOutlined style={{ fontSize: 18, color: '#FF4D4F' }} />;
        case 'excel': return <FileExcelOutlined style={{ fontSize: 18, color: '#52C41A' }} />;
        case 'image': return <FileImageOutlined style={{ fontSize: 18, color: '#1677FF' }} />;
        default: return <FileOutlined style={{ fontSize: 18, color: '#666' }} />;
    }
};

const MailDetailPage: React.FC = () => {
    const { folder, mailId } = useParams<{ folder: string; mailId: string }>();
    const navigate = useNavigate();
    const mail = mailDetailMap[mailId || '1'];

    if (!mail) {
        return (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                메일을 찾을 수 없습니다.
            </div>
        );
    }

    const infoRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 0',
        fontSize: 13,
        gap: 8,
    };

    const labelStyle: React.CSSProperties = {
        width: 70,
        color: 'var(--text-muted)',
        fontWeight: 500,
        fontSize: 12,
        flexShrink: 0,
    };

    return (
        <div style={{ maxWidth: 900 }}>
            {/* 상단 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Button
                    size="small"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/mail/${folder || 'inbox'}`)}
                >
                    목록
                </Button>
                <Button size="small" icon={<MailOutlined />}>답장</Button>
                <Button size="small" icon={<FolderOutlined />}>이동</Button>
                <Button size="small" icon={<DeleteOutlined />}>삭제</Button>
                <Button size="small" icon={<PrinterOutlined />}>인쇄</Button>
                <div style={{ flex: 1 }} />
                {mail.starred
                    ? <StarFilled style={{ color: '#FAAD14', fontSize: 18, cursor: 'pointer' }} />
                    : <StarOutlined style={{ color: '#d9d9d9', fontSize: 18, cursor: 'pointer' }} />
                }
            </div>

            {/* ─── 대제목 ─── */}
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.4 }}>
                {mail.subject}
            </h1>

            {/* ─── 메일 정보 그리드 ─── */}
            <div
                style={{
                    background: '#FAFAFA',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '12px 20px',
                    marginBottom: 20,
                }}
            >
                <div style={infoRowStyle}>
                    <span style={labelStyle}>보낸사람</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{mail.from}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>&lt;{mail.fromEmail}&gt;</span>
                </div>
                <div style={infoRowStyle}>
                    <span style={labelStyle}>받는사람</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{mail.to}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>&lt;{mail.toEmail}&gt;</span>
                </div>
                {mail.cc && (
                    <div style={infoRowStyle}>
                        <span style={labelStyle}>참조</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{mail.cc}</span>
                    </div>
                )}
                <div style={infoRowStyle}>
                    <span style={labelStyle}>보낸날짜</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{mail.date}</span>
                </div>

                {mail.attachments.length > 0 && (
                    <div style={{ ...infoRowStyle, alignItems: 'flex-start' }}>
                        <span style={labelStyle}>첨부파일</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                            {mail.attachments.map((att, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '6px 10px',
                                        background: '#fff',
                                        border: '1px solid var(--border)',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                >
                                    {getFileIcon(att.type)}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {att.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{att.size}</div>
                                    </div>
                                    <DownloadOutlined style={{ fontSize: 14, color: '#888', cursor: 'pointer' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── 메일 본문 ─── */}
            <div
                style={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: 'var(--text-primary)',
                    padding: '16px 0',
                }}
                dangerouslySetInnerHTML={{ __html: mail.content }}
            />
        </div>
    );
};

export default MailDetailPage;
