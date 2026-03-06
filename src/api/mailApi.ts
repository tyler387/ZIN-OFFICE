import api from './index';

/* ─── 메일 API ─── */
export const mailApi = {
    /** 메일 목록 조회 */
    getMailList: (folder: string, page = 1, size = 20) =>
        api.get(`/mail/${folder}`, { params: { page, size } }),

    /** 메일 상세 조회 */
    getMailDetail: (mailId: string) =>
        api.get(`/mail/detail/${mailId}`),

    /** 메일 발송 */
    sendMail: (data: { to: string; subject: string; content: string; attachments?: File[] }) =>
        api.post('/mail/send', data),

    /** 메일 삭제 */
    deleteMail: (mailIds: string[]) =>
        api.delete('/mail', { data: { mailIds } }),

    /** 메일 이동 */
    moveMail: (mailIds: string[], targetFolder: string) =>
        api.put('/mail/move', { mailIds, targetFolder }),

    /** 읽음 처리 */
    markAsRead: (mailIds: string[]) =>
        api.put('/mail/read', { mailIds }),

    /** 메일함 목록 */
    getMailboxes: () =>
        api.get('/mail/mailboxes'),
};
