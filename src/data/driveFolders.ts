/* ─── 자료실 공유 폴더 데이터 ─── */
export type DriveFolder = {
    key: string;
    name: string;
    fileCount: number;
    modified: string;
    owner: string;
};

export const companyFolders: DriveFolder[] = [
    { key: 'c1', name: '공유 자료', fileCount: 24, modified: '2026-03-05', owner: '관리자' },
    { key: 'c2', name: '부서 자료', fileCount: 18, modified: '2026-03-04', owner: '관리자' },
    { key: 'c3', name: '교육 자료', fileCount: 7, modified: '2026-02-28', owner: '관리자' },
    { key: 'c4', name: '양식 모음', fileCount: 32, modified: '2026-02-15', owner: '관리자' },
];

export const personalFolders: DriveFolder[] = [
    { key: 'p1', name: '프로젝트 자료', fileCount: 12, modified: '2026-03-05', owner: '나' },
    { key: 'p2', name: '참고 문서', fileCount: 5, modified: '2026-03-02', owner: '나' },
    { key: 'p3', name: '개인 메모', fileCount: 3, modified: '2026-03-01', owner: '나' },
];
