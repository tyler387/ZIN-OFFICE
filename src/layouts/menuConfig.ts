import React from 'react';
import {
  HomeOutlined,
  MailOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FileDoneOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ReadOutlined,
  AppstoreOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  path: string;
  badge?: number;
  bottom?: boolean;
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  { key: 'home',      label: '홈',        icon: HomeOutlined,         path: '/home' },
  { key: 'mail',      label: '메일',      icon: MailOutlined,         path: '/mail',      badge: 32 },
  { key: 'approval',  label: '전자결재',  icon: FileTextOutlined,     path: '/approval' },
  { key: 'alldocs',   label: '전사 문서함', icon: FolderOpenOutlined,  path: '/alldocs' },
  { key: 'docmgr',    label: '문서관리',  icon: FileDoneOutlined,     path: '/docmgr' },
  { key: 'drive',     label: '자료실',    icon: DatabaseOutlined,     path: '/drive' },
  { key: 'report',    label: '보고',      icon: BarChartOutlined,     path: '/report' },
  { key: 'attendance',label: '근태관리',  icon: ClockCircleOutlined,  path: '/attendance' },
  { key: 'board',     label: '게시판',    icon: ReadOutlined,         path: '/board' },
  { key: 'works',     label: 'Works',     icon: AppstoreOutlined,     path: '/works' },
  { key: 'todo',      label: 'ToDo+',     icon: CheckSquareOutlined,  path: '/todo' },
  { key: 'calendar',  label: '캘린더',    icon: CalendarOutlined,     path: '/calendar' },
  { key: 'reserve',   label: '예약',      icon: ScheduleOutlined,     path: '/reserve' },
  { key: 'community', label: '커뮤니티',  icon: TeamOutlined,         path: '/community' },
];

export const sidebarBottomItems: SidebarMenuItem[] = [
  { key: 'org',       label: '조직도',    icon: ApartmentOutlined,    path: '/org', bottom: true },
];

/* ─── SubMenu: 전자결재 ─── */
export interface SubMenuItem {
  key: string;
  label: string;
  badge?: number;
  depth?: number;      // 1=기본, 2=indent, 3=deep indent
  italic?: boolean;
  path?: string;
}

export interface SubMenuSection {
  label: string;
  showSettingsIcon?: boolean;
  items: SubMenuItem[];
}

export const approvalSubMenu: SubMenuSection[] = [
  {
    label: '결재하기',
    items: [
      { key: 'ap-wait',    label: '결재 대기 문서',      depth: 1, path: '/approval' },
      { key: 'ap-recv',    label: '결재 수신 문서',      depth: 1, path: '/approval/received' },
      { key: 'ap-ref',     label: '참조/열람 대기 문서',  depth: 1, badge: 92, path: '/approval/reference' },
      { key: 'ap-plan',    label: '결재 예정 문서',      depth: 1, path: '/approval/planned' },
    ],
  },
  {
    label: '개인 문서함',
    showSettingsIcon: true,
    items: [
      { key: 'pd-default', label: '<기본 문서함>',   depth: 1, italic: true, path: '/approval/personal/default' },
      { key: 'pd-draft',   label: '기안 문서함',     depth: 1, path: '/approval/personal/draft' },
      { key: 'pd-temp',    label: '임시 저장함',     depth: 1, path: '/approval/personal/temp' },
      { key: 'pd-done',    label: '결재 문서함',     depth: 1, path: '/approval/personal/done' },
      { key: 'pd-ref',     label: '참조/열람 문서함', depth: 1, path: '/approval/personal/ref' },
      { key: 'pd-recv',    label: '수신 문서함',     depth: 1, path: '/approval/personal/recv' },
      { key: 'pd-send',    label: '발송 문서함',     depth: 1, path: '/approval/personal/send' },
      { key: 'pd-official',label: '공문 문서함',     depth: 1, path: '/approval/personal/official' },
    ],
  },
  {
    label: '부서 문서함',
    items: [
      { key: 'dept-it',       label: 'IT서비스 부문',   depth: 1, path: '/approval/dept/it' },
      { key: 'dept-it-def',   label: '<기본 문서함>',   depth: 2, italic: true, path: '/approval/dept/it/default' },
      { key: 'dept-it-done',  label: '기안 완료함',     depth: 2, path: '/approval/dept/it/done' },
      { key: 'dept-it-ref',   label: '부서 참조함',     depth: 2, path: '/approval/dept/it/ref' },
      { key: 'dept-it-send',  label: '공문 발송함',     depth: 2, path: '/approval/dept/it/send' },
    ],
  },
];
