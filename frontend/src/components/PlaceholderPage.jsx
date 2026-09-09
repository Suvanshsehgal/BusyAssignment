import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';

export const PlaceholderPage = ({
  title,
  description,
  icon: Icon,
  roleBadge = 'Recruiter Only',
  backTo,
  backLabel,
}) => {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const paramKeys = Object.keys(params);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link if defined */}
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#60A5FA] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel || 'Back to list'}</span>
        </Link>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="flex items-start gap-3.5">
          {Icon && (
            <div className="w-10 h-10 rounded-[10px] bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
                {title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] border border-[#1E6FF0]/20">
                {roleBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Parameter details if route has URL params */}
      {paramKeys.length > 0 && (
        <div className="p-4 rounded-[10px] bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494] mb-2">
            Route Parameters
          </p>
          <div className="flex flex-wrap gap-2">
            {paramKeys.map((key) => (
              <span
                key={key}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#F5F7FB] dark:bg-[#0F1115] border border-[#E7E9EE] dark:border-[#262B35] text-[#111111] dark:text-[#F2F3F5]"
              >
                {key}: <strong className="text-[#1E6FF0]">{params[key]}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shell & RBAC Verification Card */}
      <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-[10px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D9E75] mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Route &amp; Shell Active</span>
        </div>

        <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5] mb-2">
          Phase 2 Verification Card
        </h2>

        <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed mb-6">
          This route (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#F5F7FB] dark:bg-[#0F1115] text-[#1E6FF0] border border-[#E7E9EE] dark:border-[#262B35]">{location.pathname}</code>) is protected by the application shell and role-based route guards. The authenticated session is confirmed for{' '}
          <strong>{user?.name || 'Anonymous Candidate'}</strong> ({user?.role || 'Public'}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] text-xs">
          <div className="p-3.5 rounded-[10px] bg-[#F5F7FB] dark:bg-[#0F1115] border border-[#E7E9EE] dark:border-[#262B35]">
            <div className="flex items-center gap-1.5 text-[#1E6FF0] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current Status</span>
            </div>
            <p className="text-[#4A4A4A] dark:text-[#AEB2BB]">
              Shell layout, sidebar navigation, header, theme toggle, and RBAC guards verified.
            </p>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#F5F7FB] dark:bg-[#0F1115] border border-[#E7E9EE] dark:border-[#262B35]">
            <div className="flex items-center gap-1.5 text-[#6B7280] dark:text-[#7E8494] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Next Phase</span>
            </div>
            <p className="text-[#4A4A4A] dark:text-[#AEB2BB]">
              Full business domain features, API integrations, and tables will be built in subsequent phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
