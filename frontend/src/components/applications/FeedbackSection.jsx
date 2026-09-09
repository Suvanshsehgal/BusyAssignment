import { Star, MessageSquare, Award, Clock } from 'lucide-react';

export const FeedbackSection = ({ feedbacks = [] }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            Interviewer Evaluations & Feedback ({feedbacks.length})
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
            Recorded scorecards and assessment summaries submitted by assigned panel members.
          </p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
            No Feedback Submitted Yet
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-xs mx-auto mt-1">
            Evaluations submitted by interviewers through their review portal will be logged here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => {
            const interviewer = item.interviewer || {};
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : null;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/40 dark:bg-[#15181E] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center font-bold text-xs">
                      {interviewer.name ? interviewer.name.slice(0, 2).toUpperCase() : 'IN'}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
                        {interviewer.name || 'Interviewer'}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                        {interviewer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Score Rating */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#92400E] text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.score} / 5</span>
                    </div>

                    {formattedDate && (
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2 border-t border-[#E7E9EE]/60 dark:border-[#262B35]/60 text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
