import { Link } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Star,
  UserCheck,
} from 'lucide-react';
import { StageBadge } from '../applications/StageBadge.jsx';

export const ReviewCard = ({ review }) => {
  const job = review.jobOpening || {};
  const feedbacks = review.myFeedback || [];
  const hasSubmittedFeedback = feedbacks.length > 0;
  const latestFeedback = hasSubmittedFeedback ? feedbacks[0] : null;

  const assignedDate = review.assignedAt
    ? new Date(review.assignedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#1E6FF0]/40 dark:hover:border-[#1E6FF0]/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Department Pill & Stage Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
            <Building2 className="w-3 h-3 text-[#6B7280] dark:text-[#7E8494]" />
            <span className="truncate max-w-[130px]">{job.department || 'Engineering'}</span>
          </span>

          <StageBadge stage={review.stage} />
        </div>

        {/* Candidate Name & Role */}
        <Link
          to={`/my-reviews/${review.id}`}
          className="block font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] group-hover:text-[#1E6FF0] transition-colors line-clamp-1 mb-1 focus:outline-none focus:underline"
        >
          {review.candidateName}
        </Link>

        <p className="text-xs font-medium text-[#1E6FF0] truncate mb-2">
          {job.title || 'Assigned Role'}
        </p>

        <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] truncate mb-4">
          {review.email}
        </p>
      </div>

      {/* Footer Info & Evaluation Status */}
      <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] space-y-3">
        {/* Evaluation Status Banner */}
        <div className="flex items-center justify-between text-xs">
          {hasSubmittedFeedback ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Feedback Submitted</span>
              {latestFeedback?.score && (
                <span className="flex items-center gap-0.5 ml-1 text-[10px] bg-white/70 dark:bg-black/30 px-1.5 py-0.2 rounded font-bold">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>{latestFeedback.score}/5</span>
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#92400E]">
              <Clock className="w-3.5 h-3.5" />
              <span>Feedback Pending</span>
            </div>
          )}

          {assignedDate && (
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280] dark:text-[#7E8494]" title={`Assigned on ${assignedDate}`}>
              <Calendar className="w-3 h-3" />
              <span>{assignedDate}</span>
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="flex justify-end pt-1">
          <Link
            to={`/my-reviews/${review.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6FF0] hover:text-[#1656C2] focus:outline-none focus:underline"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Open Review Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
