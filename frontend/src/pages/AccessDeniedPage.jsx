import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export const AccessDeniedPage = ({ requiredRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role;
  const permittedHome = userRole === 'recruiter' ? '/dashboard' : '/my-reviews';
  const permittedHomeLabel = userRole === 'recruiter' ? 'Recruiter Dashboard' : 'Interviewer Reviews';

  const roleDisplay = (role) => {
    if (!role) return 'Authorized Users';
    if (Array.isArray(role)) {
      return role.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ');
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-heading font-bold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Hire<span className="text-[#1E6FF0]">Stream</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-white dark:hover:bg-[#1A1D24] hover:text-[#C0392B] px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-[10px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center transition-colors duration-200">
          <div className="w-14 h-14 rounded-full bg-[#BA7517]/10 dark:bg-[#BA7517]/20 text-[#BA7517] flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#BA7517]/10 text-[#BA7517] border border-[#BA7517]/25 mb-3">
            Access Restricted
          </span>

          <h1 className="font-heading font-bold text-2xl text-[#111111] dark:text-[#F2F3F5] mb-2.5 tracking-tight">
            Role Permission Denied
          </h1>

          <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed mb-6 max-w-md mx-auto">
            You are signed in as{' '}
            <strong className="text-[#111111] dark:text-[#F2F3F5] font-semibold">
              {user?.name}
            </strong>{' '}
            with the{' '}
            <span className="capitalize font-semibold text-[#1E6FF0] dark:text-[#60A5FA]">
              {userRole || 'standard'}
            </span>{' '}
            role. This section is restricted to{' '}
            <strong className="text-[#111111] dark:text-[#F2F3F5] font-semibold">
              {roleDisplay(requiredRole)}
            </strong>{' '}
            accounts only.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(permittedHome, { replace: true })}
              className="w-full sm:w-auto rounded-full bg-[#1E6FF0] text-white hover:bg-[#1656C2] active:bg-[#1249A8] font-medium text-xs sm:text-sm py-2.5 px-6 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E6FF0] shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to {permittedHomeLabel}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#111111] dark:hover:text-[#F2F3F5] font-medium text-xs sm:text-sm py-2.5 px-5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6B7280] dark:text-[#7E8494] select-none">
        &copy; {new Date().getFullYear()} HireStream. All rights reserved.
      </footer>
    </div>
  );
};
