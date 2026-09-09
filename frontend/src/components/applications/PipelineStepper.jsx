import { Check, XCircle, AlertCircle } from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export const PipelineStepper = ({ stage, rejectedFromStage }) => {
  const isRejected = stage === 'Rejected';
  const effectiveStage = isRejected ? rejectedFromStage || 'Applied' : stage;
  const currentStageIndex = STAGES.indexOf(effectiveStage);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h3 className="font-heading font-semibold text-sm sm:text-base text-[#111111] dark:text-[#F2F3F5]">
            Hiring Pipeline Progress
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
            {isRejected
              ? `Application rejected from ${rejectedFromStage || 'previous stage'}. Candidate can be reinstated to this stage.`
              : `Current Stage: ${stage}`}
          </p>
        </div>

        {isRejected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] dark:text-[#F87171] border border-[#FECACA] dark:border-[#7F1D1D] self-start sm:self-auto">
            <XCircle className="w-3.5 h-3.5" />
            <span>Halted: Rejected</span>
          </span>
        ) : stage === 'Hired' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46] self-start sm:self-auto">
            <Check className="w-3.5 h-3.5" />
            <span>Successfully Hired</span>
          </span>
        ) : null}
      </div>

      {/* Stepper track */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="min-w-[540px] flex items-center justify-between relative">
          {/* Background connecting bar */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E7E9EE] dark:bg-[#262B35] -z-0" />

          {STAGES.map((s, index) => {
            const isPast = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            let stepIcon = <span>{index + 1}</span>;
            let circleClass =
              'border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#6B7280] dark:text-[#7E8494]';
            let labelClass = 'text-[#6B7280] dark:text-[#7E8494]';

            if (isPast) {
              stepIcon = <Check className="w-4 h-4 text-white" />;
              circleClass = 'bg-[#1E6FF0] border-[#1E6FF0] text-white';
              labelClass = 'font-semibold text-[#111111] dark:text-[#F2F3F5]';
            } else if (isCurrent) {
              if (isRejected) {
                stepIcon = <AlertCircle className="w-4 h-4 text-white" />;
                circleClass = 'bg-[#C0392B] border-[#C0392B] text-white ring-4 ring-[#C0392B]/20';
                labelClass = 'font-bold text-[#C0392B] dark:text-[#F87171]';
              } else if (s === 'Hired') {
                stepIcon = <Check className="w-4 h-4 text-white" />;
                circleClass = 'bg-[#1D9E75] border-[#1D9E75] text-white ring-4 ring-[#1D9E75]/20';
                labelClass = 'font-bold text-[#1D9E75] dark:text-[#34D399]';
              } else {
                circleClass = 'bg-[#1E6FF0] border-[#1E6FF0] text-white ring-4 ring-[#1E6FF0]/20';
                labelClass = 'font-bold text-[#1E6FF0]';
              }
            }

            return (
              <div
                key={s}
                className="flex flex-col items-center text-center relative z-10 flex-1 px-1"
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${circleClass}`}
                >
                  {stepIcon}
                </div>
                <span className={`text-xs mt-2 transition-colors ${labelClass}`}>
                  {s}
                </span>
                {isCurrent && isRejected && (
                  <span className="text-[10px] text-[#C0392B] dark:text-[#F87171] mt-0.5 font-medium">
                    (Halted Here)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
