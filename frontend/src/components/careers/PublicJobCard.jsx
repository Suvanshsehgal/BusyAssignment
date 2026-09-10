import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Clock, Sparkles } from 'lucide-react';

export const PublicJobCard = ({ job }) => {
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#1E6FF0]/40 dark:hover:border-[#1E6FF0]/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Department & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
            <Building2 className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7E8494]" />
            <span>{job.department || 'Engineering'}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            <span>Open</span>
          </span>
        </div>

        {/* Job Title */}
        <Link
          to={`/careers/${job.id}`}
          className="block font-heading font-semibold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] group-hover:text-[#1E6FF0] transition-colors line-clamp-2 mb-3 focus:outline-none focus:underline"
        >
          {job.title}
        </Link>

        {/* Description Snippet */}
        {job.description && (
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494] line-clamp-3 mb-6 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-between text-xs">
        {postedDate ? (
          <div className="flex items-center gap-1.5 text-[#6B7280] dark:text-[#7E8494]">
            <Clock className="w-3.5 h-3.5" />
            <span>Posted {postedDate}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#1E6FF0] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actively Hiring</span>
          </div>
        )}

        <Link
          to={`/careers/${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E6FF0] hover:text-[#1656C2] group-hover:translate-x-0.5 transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
