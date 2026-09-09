import {
  History,
  UserPlus,
  TrendingUp,
  XCircle,
  RotateCcw,
  UserCheck,
  UserMinus,
  MessageSquare,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const getEventConfig = (eventType) => {
  switch (eventType) {
    case 'APPLICATION_CREATED':
      return {
        label: 'Application Created',
        icon: UserPlus,
        color: 'text-[#1E6FF0] bg-[#EDF3FE] dark:bg-[rgba(30,111,240,0.15)] border-[#BFDBFE] dark:border-[#1E3A8A]',
      };
    case 'STAGE_CHANGED':
      return {
        label: 'Stage Progressed',
        icon: TrendingUp,
        color: 'text-[#0284C7] bg-[#E0F2FE] dark:bg-[rgba(2,132,199,0.15)] border-[#BAE6FD] dark:border-[#0369A1]',
      };
    case 'APPLICATION_REJECTED':
      return {
        label: 'Application Rejected',
        icon: XCircle,
        color: 'text-[#C0392B] bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] border-[#FECACA] dark:border-[#7F1D1D]',
      };
    case 'APPLICATION_REINSTATED':
      return {
        label: 'Application Reinstated',
        icon: RotateCcw,
        color: 'text-[#1D9E75] bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] border-[#A7F3D0] dark:border-[#065F46]',
      };
    case 'INTERVIEWER_ASSIGNED':
      return {
        label: 'Interviewer Assigned',
        icon: UserCheck,
        color: 'text-[#7C3AED] bg-[#F3E8FF] dark:bg-[rgba(124,58,237,0.15)] border-[#DDD6FE] dark:border-[#5B21B6]',
      };
    case 'INTERVIEWER_UNASSIGNED':
      return {
        label: 'Interviewer Removed',
        icon: UserMinus,
        color: 'text-[#BA7517] bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] border-[#FDE68A] dark:border-[#92400E]',
      };
    case 'FEEDBACK_SUBMITTED':
      return {
        label: 'Feedback Submitted',
        icon: MessageSquare,
        color: 'text-[#1D9E75] bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] border-[#A7F3D0] dark:border-[#065F46]',
      };
    default:
      return {
        label: eventType || 'Audit Event',
        icon: Clock,
        color: 'text-[#6B7280] bg-[#F5F7FB] dark:bg-[#15181E] border-[#E7E9EE] dark:border-[#262B35]',
      };
  }
};

export const TimelineSection = ({ timeline = [] }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
              Immutable Audit Timeline ({timeline.length})
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
              Chronological history of all pipeline stage changes, assignments, and evaluations.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Read Only</span>
        </span>
      </div>

      {timeline.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
            No Audit Events Recorded
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[#E7E9EE] dark:before:bg-[#262B35]">
          {timeline.map((event) => {
            const config = getEventConfig(event.eventType);
            const Icon = config.icon;
            const actor = event.user || {};
            const details = event.details || {};
            const dateStr = event.createdAt
              ? new Date(event.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : null;

            return (
              <div key={event.id} className="relative group">
                {/* Bullet Node */}
                <div
                  className={`absolute -left-6 top-0 w-5 h-5 rounded-full border flex items-center justify-center -translate-x-1/2 bg-white dark:bg-[#1A1D24] ${config.color}`}
                >
                  <Icon className="w-2.5 h-2.5" />
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/40 dark:bg-[#15181E] text-xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111111] dark:text-[#F2F3F5]">
                        {config.label}
                      </span>
                      {event.newStage && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
                          {event.newStage}
                        </span>
                      )}
                    </div>
                    {dateStr && (
                      <span className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                        {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Actor details */}
                  <p className="text-[11px] text-[#4A4A4A] dark:text-[#AEB2BB]">
                    By:{' '}
                    <strong className="text-[#111111] dark:text-[#F2F3F5]">
                      {actor.name || 'System / Candidate'}
                    </strong>
                    {actor.role && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-gray-100 dark:bg-gray-800 text-[#6B7280] dark:text-[#7E8494]">
                        {actor.role}
                      </span>
                    )}
                  </p>

                  {/* Specific notes or reason */}
                  {(details.notes || details.reason || details.interviewerName) && (
                    <div className="mt-1 pt-1.5 border-t border-[#E7E9EE]/60 dark:border-[#262B35]/60 text-[#4A4A4A] dark:text-[#AEB2BB] text-[11px] italic">
                      {details.notes && <span>{details.notes}</span>}
                      {details.reason && <span>Reason: {details.reason}</span>}
                      {details.interviewerName && (
                        <span>Interviewer: {details.interviewerName}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
