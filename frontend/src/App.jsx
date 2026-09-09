import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import { LoginPage } from './pages/LoginPage.jsx';
import { AuthStatusPage } from './pages/AuthStatusPage.jsx';
import { GetStartedPage } from './pages/GetStartedPage.jsx';

const RootRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] dark:bg-[#0F1115]">
        <div className="w-8 h-8 border-3 border-[#1E6FF0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <AuthStatusPage /> : <GetStartedPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Root Route: Shows GetStartedPage when unauthenticated, AuthStatusPage when authenticated */}
            <Route path="/" element={<RootRoute />} />

            {/* Direct Get Started Landing Route */}
            <Route path="/get-started" element={<GetStartedPage />} />

            {/* Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
