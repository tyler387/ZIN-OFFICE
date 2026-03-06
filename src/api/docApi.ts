import api from './index';

/* ─── 문서관리 / 전사문서함 API ─── */
export const docApi = {
    /** 전사 문서함 목록 */
    getAllDocs: (page = 1, size = 20, formType?: string) =>
        api.get('/docs/all', { params: { page, size, formType } }),

    /** 문서관리 - 카테고리별 목록 */
    getDocsByCategory: (category: string, page = 1) =>
        api.get(`/docs/manage/${category}`, { params: { page } }),

    /** 문서 등록 */
    registerDoc: (data: { title: string; category: string; content: string }) =>
        api.post('/docs', data),

    /** 문서 상세 */
    getDocDetail: (id: string) =>
        api.get(`/docs/${id}`),
};
