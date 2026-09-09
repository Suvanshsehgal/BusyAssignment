import { Users, Calendar, ShieldCheck } from 'lucide-react';

export const InterviewerPanelReadOnly = ({ panel = [] }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Interview Panel Members ({panel.length})
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
              Colleagues assigned alongside you to evaluate this candidate.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Read Only</span>
        </span>
      </div>

      {panel.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
            No Interview Panel Members Assigned
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-xs mx-auto mt-1">
            The recruiting team has not scheduled any panel members for this application yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {panel.map((member) => {
            const user = member.user || {};
            const scheduledText = member.scheduledAt
              ? new Date(member.scheduledAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : null;

            return (
              <div
                key={member.id || member.userId}
                className="flex items-center justify-between p-4 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/40 dark:bg-[#15181E]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
                      {user.name || 'Assigned Interviewer'}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                      {user.email || 'No email provided'}
                    </p>
                    {scheduledText && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#6B7280] dark:text-[#7E8494]">
                        <Calendar className="w-3 h-3 text-[#1E6FF0]" />
                        <span>Scheduled: {scheduledText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] border border-[#BFDBFE] dark:border-[#1E3A8A]">
                  {user.role || 'interviewer'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
