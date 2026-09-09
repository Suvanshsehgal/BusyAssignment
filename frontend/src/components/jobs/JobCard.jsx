import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight, Building2 } from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge.jsx';

export const JobCard = ({ job }) => {
  const applicantCount = job._count?.applications ?? 0;

  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#1E6FF0]/40 dark:hover:border-[#1E6FF0]/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top bar: Department & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
            <Building2 className="w-3 h-3 text-[#6B7280] dark:text-[#7E8494]" />
            <span className="truncate max-w-[130px]">{job.department}</span>
          </span>

          <JobStatusBadge status={job.status} />
        </div>

        {/* Title */}
        <Link
          to={`/jobs/${job.id}`}
          className="block font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] group-hover:text-[#1E6FF0] transition-colors line-clamp-1 mb-2 focus:outline-none focus:underline"
        >
          {job.title}
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] line-clamp-2 leading-relaxed mb-4">
          {job.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[#6B7280] dark:text-[#7E8494]">
          {/* Applicants */}
          <div
            className="flex items-center gap-1.5 font-medium"
            title={`${applicantCount} total candidate applications`}
          >
            <Users className="w-3.5 h-3.5 text-[#1E6FF0]" />
            <span>
              {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}
            </span>
          </div>

          {/* Created date */}
          {formattedDate && (
            <div className="hidden sm:flex items-center gap-1.5" title={`Created on ${formattedDate}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Action Link */}
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6FF0] hover:text-[#1656C2] focus:outline-none focus:underline"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
