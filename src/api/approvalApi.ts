import api from './index';

/* ─── 전자결재 API ─── */
export const approvalApi = {
    /** 결재 대기 목록 */
    getPendingList: (page = 1, size = 20) =>
        api.get('/approval/pending', { params: { page, size } }),

    /** 결재 예정 목록 */
    getPlannedList: (page = 1, size = 20) =>
        api.get('/approval/planned', { params: { page, size } }),

    /** 참조/열람 대기 목록 */
    getReferenceList: (page = 1, size = 20) =>
        api.get('/approval/reference', { params: { page, size } }),

    /** 추가된 참조/열람 대기 문서 개수 API */
    getReferenceCount: () =>
        api.get<number>('/approval/reference/count'),

    /** 결재 문서 상세 */
    getDetail: (id: string) =>
        api.get(`/approval/${id}`),

    /** 결재 문서 생성 (기안) */
    createDraft: (data: { formType: string; title: string; content: string }) =>
        api.post('/approval/draft', data),

    /** 결재 승인 */
    approve: (id: string, comment?: string) =>
        api.put(`/approval/${id}/approve`, { comment }),

    /** 결재 반려 */
    reject: (id: string, reason: string) =>
        api.put(`/approval/${id}/reject`, { reason }),

    /** 기안 취소 */
    cancel: (id: string) =>
        api.put(`/approval/${id}/cancel`),

    /** 반려 문서 재기안 */
    resubmit: (id: string, data: { formType: string; title: string; content: string }) =>
        api.post(`/approval/${id}/resubmit`, data),

    /** 참조 문서 열람 */
    view: (id: string) =>
        api.put(`/approval/${id}/view`),

    /** 개인 문서함 */
    getPersonalDocs: (folder: string, page = 1) =>
        api.get(`/approval/personal/${folder}`, { params: { page } }),

    /** 부서 문서함 */
    getDeptDocs: (deptId: string, folder: string, page = 1) =>
        api.get(`/approval/dept/${deptId}/${folder}`, { params: { page } }),
};
