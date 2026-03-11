import api from './index';

export const docApi = {
    /** 전사 문서함 전체 조회 */
    getAllDocs: (page = 0, size = 20, formType = 'all') =>
        api.get('/docs/all', { params: { page, size, formType } }),

    /** 문서 관리 (recent, updated, pending-approval, pending-register) */
    getManageDocs: (category: string, page = 0, size = 20) =>
        api.get(`/docs/manage/${category}`, { params: { page, size } }),

    /** 단순 문서 등록 (결재 없이) */
    createDoc: (data: { title: string; content: string; formType?: string }) =>
        api.post('/docs', data),

    /** 문서 읽기 및 상세 정보 조회 */
    getDocDetail: (id: string) =>
        api.get(`/docs/${id}`),
};
