import { Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { ThemeToggle } from './ThemeToggle.jsx';

export const Header = ({ onMenuClick }) => {
  const { user, logout, isRecruiter } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white dark:bg-[#1A1D24] border-b border-[#E7E9EE] dark:border-[#262B35] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left Area: Mobile Hamburger Button & Portal Brand Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="lg:hidden p-2 rounded-[10px] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 select-none">
          <span className="hidden sm:inline text-xs font-medium text-[#6B7280] dark:text-[#7E8494]">
            Workspace
          </span>
          <span className="hidden sm:inline text-[#6B7280] dark:text-[#7E8494] text-xs">/</span>
          <span className="text-xs sm:text-sm font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]">
            {isRecruiter ? 'Recruitment Hub' : 'Reviewer Workspace'}
          </span>
        </div>
      </div>

      {/* Right Area: Role Badge, Theme Toggle, User Profile, and Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Role Badge */}
        <div
          className={`
            hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
            ${
              isRecruiter
                ? 'bg-[#EDF3FE] dark:bg-[#1E293B] text-[#1E6FF0] dark:text-[#60A5FA] border-[#1E6FF0]/25'
                : 'bg-[#F3E8FF] dark:bg-[#2E1065] text-[#8B5CF6] dark:text-[#C084FC] border-[#8B5CF6]/25'
            }
          `}
        >
          <Shield className="w-3 h-3" />
          <span className="capitalize">{user?.role || 'User'}</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Mini Profile */}
        <div className="hidden md:flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB] dark:bg-[#0F1115]">
          <div
            className={`
              w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white
              ${isRecruiter ? 'bg-[#1E6FF0]' : 'bg-[#8B5CF6]'}
            `}
          >
            {getInitials(user?.name)}
          </div>
          <div className="pr-1 text-left select-none">
            <p className="text-xs font-medium text-[#111111] dark:text-[#F2F3F5] leading-tight max-w-[130px] truncate">
              {user?.name || 'User'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#C0392B] dark:hover:text-[#F87171] px-3 sm:px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
