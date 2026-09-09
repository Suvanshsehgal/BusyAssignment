export const StageBadge = ({ stage, rejectedFromStage, className = '' }) => {
  const currentStage = stage || 'Applied';

  let badgeStyles = 'bg-[#EDF3FE] text-[#1E6FF0] dark:bg-[rgba(30,111,240,0.15)] dark:text-[#60A5FA] border-[#BFDBFE] dark:border-[#1E3A8A]';
  let dotColor = 'bg-[#1E6FF0] dark:bg-[#60A5FA]';

  if (currentStage === 'Screening') {
    badgeStyles = 'bg-[#E0F2FE] text-[#0284C7] dark:bg-[rgba(2,132,199,0.15)] dark:text-[#38BDF8] border-[#BAE6FD] dark:border-[#0369A1]';
    dotColor = 'bg-[#0284C7] dark:bg-[#38BDF8]';
  } else if (currentStage === 'Interview') {
    badgeStyles = 'bg-[#FEF7E6] text-[#BA7517] dark:bg-[rgba(186,117,23,0.15)] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#92400E]';
    dotColor = 'bg-[#BA7517] dark:bg-[#FBBF24]';
  } else if (currentStage === 'Offer') {
    badgeStyles = 'bg-[#F3E8FF] text-[#7C3AED] dark:bg-[rgba(124,58,237,0.15)] dark:text-[#A78BFA] border-[#DDD6FE] dark:border-[#5B21B6]';
    dotColor = 'bg-[#7C3AED] dark:bg-[#A78BFA]';
  } else if (currentStage === 'Hired') {
    badgeStyles = 'bg-[#E8F8F2] text-[#1D9E75] dark:bg-[rgba(29,158,117,0.15)] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#065F46]';
    dotColor = 'bg-[#1D9E75] dark:bg-[#34D399]';
  } else if (currentStage === 'Rejected') {
    badgeStyles = 'bg-[#FDF2F1] text-[#C0392B] dark:bg-[rgba(192,57,43,0.15)] dark:text-[#F87171] border-[#FECACA] dark:border-[#7F1D1D]';
    dotColor = 'bg-[#C0392B] dark:bg-[#F87171]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${badgeStyles} ${className}`}
      aria-label={`Application stage: ${currentStage}${rejectedFromStage ? ` (rejected from ${rejectedFromStage})` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{currentStage}</span>
      {currentStage === 'Rejected' && rejectedFromStage && (
        <span className="opacity-75 text-[10px] font-normal">
          (from {rejectedFromStage})
        </span>
      )}
    </span>
  );
};
