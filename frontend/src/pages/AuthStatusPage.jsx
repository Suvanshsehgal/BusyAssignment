import { useAuth } from '../context/useAuth.js';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { LogOut, UserCheck, Shield } from 'lucide-react';

export const AuthStatusPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-heading font-bold text-lg text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Hire<span className="text-[#1E6FF0]">Stream</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#111111] dark:hover:text-[#F2F3F5] px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-[10px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#EDF3FE] dark:bg-[#212836] flex items-center justify-center text-[#1E6FF0]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-[#111111] dark:text-[#F2F3F5]">
                  {user?.name}
                </h1>
                <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">{user?.email}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] border border-[#1E6FF0]/20">
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{user?.role} Role Verified</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E7E9EE] dark:border-[#262B35]">
            <h2 className="font-heading font-semibold text-sm text-[#111111] dark:text-[#F2F3F5] mb-2">
              Authentication Foundation Active
            </h2>
            <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed">
              Your session is active and validated with the backend. Outbound requests attach your verified JWT token, and the backend has resolved your role as <strong>{user?.role}</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
