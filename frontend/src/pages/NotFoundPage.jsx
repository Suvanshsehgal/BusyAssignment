import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';

export const NotFoundPage = () => {
  const { isAuthenticated, isRecruiter } = useAuth();
  const navigate = useNavigate();

  const homePath = isAuthenticated
    ? isRecruiter
      ? '/dashboard'
      : '/my-reviews'
    : '/';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold text-[#1E6FF0] uppercase tracking-widest mb-1">
        404 Error
      </span>

      <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] mb-2">
        Page Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494] max-w-sm mb-6 leading-relaxed">
        The requested URL was not found on this server. Please check the address or return home.
      </p>

      <button
        type="button"
        onClick={() => navigate(homePath, { replace: true })}
        className="rounded-full bg-[#1E6FF0] text-white hover:bg-[#1656C2] active:bg-[#1249A8] font-medium text-xs sm:text-sm py-2.5 px-6 transition-colors shadow-sm flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Application</span>
      </button>
    </div>
  );
};
