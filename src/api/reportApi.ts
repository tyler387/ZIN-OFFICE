import api from './index';

/* ─── 보고 API ─── */
export const reportApi = {
    /** 최근 보고서 목록 */
    getRecentReports: (page = 1, size = 20) =>
        api.get('/report/recent', { params: { page, size } }),

    /** 부서별 보고서 */
    getDeptReports: (deptId?: string, page = 1) =>
        api.get('/report/department', { params: { deptId, page } }),

    /** 보고서 상세 */
    getDetail: (id: string) =>
        api.get(`/report/${id}`),

    /** 보고서 생성 */
    createReport: (data: { type: string; title: string; content: string }) =>
        api.post('/report', data),
};
