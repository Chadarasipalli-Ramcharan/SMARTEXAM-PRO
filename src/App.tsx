import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Student pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { AvailableExams } from '@/pages/student/AvailableExams';
import { ExamInstructions } from '@/pages/student/ExamInstructions';
import { LiveExam } from '@/pages/student/LiveExam';
import { ResultDetail } from '@/pages/student/ResultDetail';
import { MyResults } from '@/pages/student/MyResults';
import { ProfilePage } from '@/pages/student/ProfilePage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { StudentManagement } from '@/pages/admin/StudentManagement';
import { ExamManagement } from '@/pages/admin/ExamManagement';
import { QuestionManagement } from '@/pages/admin/QuestionManagement';
import { ResultManagement } from '@/pages/admin/ResultManagement';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/exams" element={<AvailableExams />} />
        <Route path="/exam/:examId" element={<ExamInstructions />} />
        <Route path="/exam/:examId/take" element={<LiveExam />} />
        <Route path="/results" element={<MyResults />} />
        <Route path="/results/:examId" element={<ResultDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/exams" element={<ExamManagement />} />
        <Route path="/admin/questions/:examId" element={<QuestionManagement />} />
        <Route path="/admin/results" element={<ResultManagement />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
