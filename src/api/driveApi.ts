import api from './index';

/* ─── 자료실 API ─── */
export const driveApi = {
    /** 폴더 목록 */
    getFolders: (type: 'company' | 'personal') =>
        api.get(`/drive/${type}/folders`),

    /** 폴더 내 파일 목록 */
    getFiles: (type: string, folderId: string) =>
        api.get(`/drive/${type}/${folderId}/files`),

    /** 폴더 생성 */
    createFolder: (type: string, name: string) =>
        api.post(`/drive/${type}/folders`, { name }),

    /** 파일 업로드 */
    uploadFile: (type: string, folderId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/drive/${type}/${folderId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** 파일 삭제 */
    deleteFile: (fileId: string) =>
        api.delete(`/drive/files/${fileId}`),

    /** 용량 조회 */
    getStorageUsage: () =>
        api.get('/drive/storage'),
};
