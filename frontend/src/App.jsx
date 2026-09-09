import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import { RoleRoute } from './components/RoleRoute.jsx';

// Layouts
import { RecruiterLayout } from './layouts/RecruiterLayout.jsx';
import { InterviewerLayout } from './layouts/InterviewerLayout.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';

// Auth & Landing Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { GetStartedPage } from './pages/GetStartedPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Recruiter Pages (Placeholder)
import { DashboardPage } from './pages/recruiter/DashboardPage.jsx';
import { JobsPage } from './pages/recruiter/JobsPage.jsx';
import { JobDetailPage } from './pages/recruiter/JobDetailPage.jsx';
import { ApplicationsPage } from './pages/recruiter/ApplicationsPage.jsx';
import { ApplicationDetailPage } from './pages/recruiter/ApplicationDetailPage.jsx';
import { AnalyticsPage } from './pages/recruiter/AnalyticsPage.jsx';
import { AlertsPage } from './pages/recruiter/AlertsPage.jsx';

// Interviewer Pages (Placeholder)
import { MyReviewsPage } from './pages/interviewer/MyReviewsPage.jsx';
import { ReviewDetailPage } from './pages/interviewer/ReviewDetailPage.jsx';

// Public Careers Pages (Placeholder)
import { CareersPage } from './pages/careers/CareersPage.jsx';
import { CareersJobDetailPage } from './pages/careers/CareersJobDetailPage.jsx';
import { CareersApplyPage } from './pages/careers/CareersApplyPage.jsx';

/**
 * RootRoute directs:
 * - Unauthenticated users to GetStartedPage
 * - Authenticated Recruiters to /dashboard
 * - Authenticated Interviewers to /my-reviews
 */
const RootRoute = () => {
  const { isAuthenticated, isRecruiter, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] dark:bg-[#0F1115]">
        <div className="w-8 h-8 border-3 border-[#1E6FF0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GetStartedPage />;
  }

  return <Navigate to={isRecruiter ? '/dashboard' : '/my-reviews'} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* 1. Root and Public Landing */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Recruiter Routes (Protected + Role Guard: 'recruiter') */}
            <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
              <Route element={<RecruiterLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
              </Route>
            </Route>

            {/* 3. Interviewer Routes (Protected + Role Guard: 'interviewer') */}
            <Route element={<RoleRoute allowedRoles={['interviewer']} />}>
              <Route element={<InterviewerLayout />}>
                <Route path="/my-reviews" element={<MyReviewsPage />} />
                <Route path="/my-reviews/:id" element={<ReviewDetailPage />} />
              </Route>
            </Route>

            {/* 4. Public Careers Routes (Unauthenticated, Public Layout) */}
            <Route element={<PublicLayout />}>
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/careers/:jobId" element={<CareersJobDetailPage />} />
              <Route path="/careers/:jobId/apply" element={<CareersApplyPage />} />
            </Route>

            {/* 5. 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
