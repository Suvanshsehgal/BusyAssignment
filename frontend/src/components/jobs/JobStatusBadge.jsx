export const JobStatusBadge = ({ status, className = '' }) => {
  const normalizedStatus = status || 'Open';

  let badgeStyles = 'bg-[#E8F8F2] text-[#1D9E75] dark:bg-[rgba(29,158,117,0.15)] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#065F46]';
  let dotColor = 'bg-[#1D9E75] dark:bg-[#34D399]';

  if (normalizedStatus === 'Closed') {
    badgeStyles = 'bg-[#FEF7E6] text-[#BA7517] dark:bg-[rgba(186,117,23,0.15)] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#92400E]';
    dotColor = 'bg-[#BA7517] dark:bg-[#FBBF24]';
  } else if (normalizedStatus === 'Archived') {
    badgeStyles = 'bg-[#FDF2F1] text-[#C0392B] dark:bg-[rgba(192,57,43,0.15)] dark:text-[#F87171] border-[#FECACA] dark:border-[#7F1D1D]';
    dotColor = 'bg-[#C0392B] dark:bg-[#F87171]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${badgeStyles} ${className}`}
      aria-label={`Job status: ${normalizedStatus}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{normalizedStatus}</span>
    </span>
  );
};
