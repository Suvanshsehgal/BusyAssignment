import { NavLink } from 'react-router-dom';
import { X, LogOut, Briefcase, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';

export const Sidebar = ({
  navItems,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation sidebar"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-200 cursor-pointer"
        />
      )}

      {/* Sticky & Collapsible Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50
          bg-white dark:bg-[#1A1D24]
          border-r border-[#E7E9EE] dark:border-[#262B35]
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:h-dvh lg:overflow-y-auto lg:overflow-x-hidden shrink-0 select-none
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
          ${isOpen ? 'translate-x-0 w-64 shadow-xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#E7E9EE] dark:border-[#262B35] shrink-0">
            <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'lg:mx-auto' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                H
              </div>
              {!isCollapsed && (
                <span className="font-heading font-bold text-lg text-[#111111] dark:text-[#F2F3F5] tracking-tight truncate whitespace-nowrap">
                  Hire<span className="text-[#1E6FF0]">Stream</span>
                </span>
              )}
            </div>

            {/* Desktop Collapse Toggle Button (when expanded) */}
            {onToggleCollapse && !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden lg:flex p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="lg:hidden p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#212836] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Expand Toggle Button (when collapsed) */}
          {onToggleCollapse && isCollapsed && (
            <div className="hidden lg:flex justify-center pt-2.5 pb-1 border-b border-[#E7E9EE] dark:border-[#262B35]">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#EDF3FE] dark:hover:bg-[#212836] hover:text-[#1E6FF0] dark:hover:text-[#60A5FA] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Role Status Tag */}
          <div
            className={`border-b border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/50 dark:bg-[#0F1115]/40 flex items-center ${
              isCollapsed ? 'lg:justify-center p-2.5' : 'px-5 py-3 justify-between'
            }`}
          >
            {isCollapsed ? (
              <div
                title={user?.role ? `${user.role.toUpperCase()} PORTAL` : 'PORTAL'}
                className="flex items-center justify-center"
              >
                {isRecruiter ? (
                  <Briefcase className="w-4 h-4 text-[#1E6FF0]" />
                ) : (
                  <Users className="w-4 h-4 text-[#8B5CF6]" />
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {isRecruiter ? (
                    <Briefcase className="w-3.5 h-3.5 text-[#1E6FF0]" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494]">
                    Portal
                  </span>
                </div>
                <span
                  className={`
                    px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                    ${
                      isRecruiter
                        ? 'bg-[#EDF3FE] dark:bg-[#1E293B] text-[#1E6FF0] dark:text-[#60A5FA] border-[#1E6FF0]/25'
                        : 'bg-[#F3E8FF] dark:bg-[#2E1065] text-[#8B5CF6] dark:text-[#C084FC] border-[#8B5CF6]/25'
                    }
                  `}
                >
                  {user?.role || 'User'}
                </span>
              </>
            )}
          </div>

          {/* Nav List */}
          <nav className="p-2 lg:p-3 space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  end={item.end}
                  className={({ isActive }) => `
                    group relative flex items-center rounded-[10px] text-xs font-medium transition-all duration-150
                    ${
                      isCollapsed
                        ? 'lg:justify-center lg:px-0 lg:py-3 px-3.5 py-2.5 gap-3'
                        : 'px-3.5 py-2.5 gap-3'
                    }
                    ${
                      isActive
                        ? 'bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] dark:text-[#60A5FA] font-semibold border-l-3 border-[#1E6FF0]'
                        : 'text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] dark:hover:bg-[#15181E] hover:text-[#111111] dark:hover:text-[#F2F3F5]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-colors" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    isCollapsed ? (
                      <span
                        title={`${item.badge} notifications`}
                        className="hidden lg:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C0392B]"
                      />
                    ) : (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C0392B]/10 text-[#C0392B]">
                        {item.badge}
                      </span>
                    )
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        <div className="p-2 lg:p-3 border-t border-[#E7E9EE] dark:border-[#262B35] shrink-0">
          <div
            className={`rounded-[10px] bg-[#F5F7FB] dark:bg-[#0F1115] border border-[#E7E9EE] dark:border-[#262B35] flex items-center ${
              isCollapsed
                ? 'lg:flex-col lg:gap-2 lg:p-2 p-2.5 justify-between gap-2'
                : 'p-2.5 justify-between gap-2'
            }`}
          >
            <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div
                title={user?.name || 'User'}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-xs
                  ${isRecruiter ? 'bg-[#1E6FF0]' : 'bg-[#8B5CF6]'}
                `}
              >
                {getInitials(user?.name)}
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] truncate leading-snug">
                    {user?.name || 'Authenticated User'}
                  </p>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#7E8494] truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-white dark:hover:bg-[#1A1D24] hover:text-[#C0392B] dark:hover:text-[#F87171] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
