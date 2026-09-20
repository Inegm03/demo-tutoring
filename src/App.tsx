import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole, useAuth } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import Landing from './pages/Landing';
import SignIn from './pages/auth/SignIn';
import Register from './pages/auth/Register';
import Forgot from './pages/auth/Forgot';
import StudentDashboard from './pages/student/StudentDashboard';
import RequestWizard from './pages/student/RequestWizard';
import Matching from './pages/student/Matching';
import Wallet from './pages/student/Wallet';
import StudentHistory from './pages/student/StudentHistory';
import StudentProfile from './pages/student/StudentProfile';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherEarnings from './pages/teacher/TeacherEarnings';
import TeacherHistory from './pages/teacher/TeacherHistory';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import SessionRoom from './pages/session/SessionRoom';
import SessionComplete from './pages/session/SessionComplete';
import LegalPage from './pages/legal/LegalPage';
import NotFound from './pages/NotFound';

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/teacher'} replace /> : <Landing />} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot" element={<Forgot />} />

      <Route path="/legal/:doc" element={<LegalPage />} />

      {/* student */}
      <Route path="/student" element={<RequireRole role="student"><AppShell><StudentDashboard /></AppShell></RequireRole>} />
      <Route path="/student/request" element={<RequireRole role="student"><AppShell><RequestWizard /></AppShell></RequireRole>} />
      <Route path="/student/matching/:id" element={<RequireRole role="student"><AppShell><Matching /></AppShell></RequireRole>} />
      <Route path="/student/wallet" element={<RequireRole role="student"><AppShell><Wallet /></AppShell></RequireRole>} />
      <Route path="/student/history" element={<RequireRole role="student"><AppShell><StudentHistory /></AppShell></RequireRole>} />
      <Route path="/student/profile" element={<RequireRole role="student"><AppShell><StudentProfile /></AppShell></RequireRole>} />

      {/* teacher */}
      <Route path="/teacher" element={<RequireRole role="teacher"><AppShell><TeacherDashboard /></AppShell></RequireRole>} />
      <Route path="/teacher/earnings" element={<RequireRole role="teacher"><AppShell><TeacherEarnings /></AppShell></RequireRole>} />
      <Route path="/teacher/history" element={<RequireRole role="teacher"><AppShell><TeacherHistory /></AppShell></RequireRole>} />
      <Route path="/teacher/profile" element={<RequireRole role="teacher"><AppShell><TeacherProfilePage /></AppShell></RequireRole>} />

      {/* shared session routes */}
      <Route path="/session/:id" element={<RequireAuth><SessionRoom /></RequireAuth>} />
      <Route path="/session/:id/complete" element={<RequireAuth><AppShell><SessionComplete /></AppShell></RequireAuth>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
