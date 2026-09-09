import { Outlet, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Public Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-heading font-bold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Hire<span className="text-[#1E6FF0]">Stream</span>
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
            Careers
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-white dark:hover:bg-[#1A1D24] hover:text-[#111111] dark:hover:text-[#F2F3F5] px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            Staff Sign In
          </button>
        </div>
      </header>

      {/* Public Page Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#E7E9EE] dark:border-[#262B35] py-4 text-center text-xs text-[#6B7280] dark:text-[#7E8494] select-none">
        &copy; {new Date().getFullYear()} HireStream Careers. All rights reserved.
      </footer>
    </div>
  );
};
