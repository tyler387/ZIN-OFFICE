import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ApprovalHomePage from './pages/ApprovalHomePage';
import ApprovalNewPage from './pages/ApprovalNewPage';
import ApprovalDetailPage from './pages/ApprovalDetailPage';
import BoardPage from './pages/BoardPage';
import PostNewPage from './pages/PostNewPage';
import PostDetailPage from './pages/PostDetailPage';
import DrivePage from './pages/DrivePage';
import AllDocsPage from './pages/AllDocsPage';
import DocMgrPage from './pages/DocMgrPage';
import ReportPage from './pages/ReportPage';
import AttendancePage from './pages/AttendancePage';
import MailPage from './pages/MailPage';
import MailDetailPage from './pages/MailDetailPage';
import MessengerPage from './pages/MessengerPage';
import CalendarPage from './pages/CalendarPage';
import ReservePage from './pages/ReservePage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Login - standalone page without AppLayout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main app with AppLayout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="approval" element={<ApprovalHomePage />} />
        <Route path="approval/new" element={<ApprovalNewPage />} />
        <Route path="approval/:id" element={<ApprovalDetailPage />} />
        <Route path="board" element={<Navigate to="/board/notice" replace />} />
        <Route path="board/:boardId" element={<BoardPage />} />
        <Route path="board/:boardId/posts/new" element={<PostNewPage />} />
        <Route path="board/:boardId/posts/:postId" element={<PostDetailPage />} />
        <Route path="drive" element={<Navigate to="/drive/company" replace />} />
        <Route path="drive/:driveType" element={<DrivePage />} />
        <Route path="drive/:driveType/:folderId" element={<DrivePage />} />
        <Route path="alldocs" element={<AllDocsPage />} />
        <Route path="docmgr" element={<Navigate to="/docmgr/recent" replace />} />
        <Route path="docmgr/:category" element={<DocMgrPage />} />
        <Route path="mail" element={<Navigate to="/mail/inbox" replace />} />
        <Route path="mail/:folder" element={<MailPage />} />
        <Route path="mail/:folder/:mailId" element={<MailDetailPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="report/:type" element={<ReportPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/:section" element={<AttendancePage />} />
        <Route path="messenger" element={<MessengerPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reserve" element={<Navigate to="/reserve/room" replace />} />
        <Route path="reserve/:type" element={<ReservePage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
