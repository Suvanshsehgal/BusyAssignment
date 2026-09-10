import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAlerts, useDismissAlert } from '../../hooks/useAlerts.js';
import { StageBadge } from '../../components/applications/StageBadge.jsx';

export const AlertsPage = () => {
  const { data: alerts = [], isLoading, isError, error, refetch, isFetching } = useAlerts();
  const dismissMutation = useDismissAlert();

  const [dismissingId, setDismissingId] = useState(null);
  const [dismissError, setDismissError] = useState(null);

  const handleDismiss = async (alertItem) => {
    setDismissingId(alertItem.applicationId);
    setDismissError(null);

    try {
      await dismissMutation.mutateAsync(alertItem.applicationId);
    } catch (err) {
      setDismissError(
        err.response?.data?.message ||
          err.message ||
          `Failed to dismiss alert for ${alertItem.candidateName}.`
      );
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517] dark:text-[#FBBF24] mb-2 border border-[#FDE68A] dark:border-[#92400E]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SLA Pipeline Monitoring</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Stalled Candidate SLA Alerts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494] mt-1">
            Candidates who have remained in the same non-terminal pipeline stage for more than 10 days without progression.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#1E6FF0]' : ''}`} />
          <span>{isFetching ? 'Checking Alerts...' : 'Refresh Alerts'}</span>
        </button>
      </div>

      {/* Dismissal Error Alert */}
      {dismissError && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Dismissal Failed</span>
            <p className="leading-relaxed">{dismissError}</p>
          </div>
        </div>
      )}

      {/* SLA Policy Explainer Strip */}
      <div className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#4A4A4A] dark:text-[#AEB2BB]">
          <ShieldCheck className="w-4 h-4 text-[#1E6FF0] shrink-0" />
          <span>
            <strong>Stage-Specific Dismissal Policy:</strong> Dismissing an alert acknowledges the stalled status for the candidate&apos;s <em>current</em> stage. If the candidate advances and later stalls in a subsequent stage, a new alert will be surfaced.
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold text-[#BA7517] dark:text-[#FBBF24] shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>Threshold: &gt;10 Days</span>
        </span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {isError && (
        <div className="p-8 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#C0392B] dark:text-[#F87171] mx-auto" />
          <h3 className="font-heading font-semibold text-base text-[#C0392B] dark:text-[#F87171]">
            Unable to retrieve stalled candidate alerts
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] max-w-md mx-auto">
            {error?.response?.data?.message ||
              error?.message ||
              'A network or authorization error occurred while querying active alerts.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs font-semibold hover:bg-[#a93226] transition-colors"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Zero Alerts State */}
      {!isLoading && !isError && alerts.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-8 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            No Stalled Candidates Found
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] max-w-sm mx-auto">
            All active candidates across your job openings are progressing within the healthy 10-day stage SLA window.
          </p>
        </div>
      )}

      {/* Active Alerts List */}
      {!isLoading && !isError && alerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#7E8494] px-1">
            <span>
              Showing <strong className="text-[#111111] dark:text-[#F2F3F5]">{alerts.length}</strong> stalled candidate{alerts.length === 1 ? '' : 's'} requiring recruiter action
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {alerts.map((alertItem) => {
              const isDismissing = dismissingId === alertItem.applicationId;
              const enteredDate = alertItem.stageEnteredAt
                ? new Date(alertItem.stageEnteredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown date';

              return (
                <div
                  key={alertItem.id}
                  className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#BA7517]/40 dark:hover:border-[#BA7517]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Candidate & Stalled Status Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#92400E]">
                        <Clock className="w-3 h-3" />
                        <span>Stalled {alertItem.daysStalled} Days</span>
                      </span>

                      <StageBadge stage={alertItem.stage} />

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35]">
                        <Building2 className="w-3 h-3 text-[#6B7280] dark:text-[#7E8494]" />
                        <span>{alertItem.department}</span>
                      </span>
                    </div>

                    <div>
                      <Link
                        to={`/applications/${alertItem.applicationId}`}
                        className="font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:underline"
                      >
                        <span>{alertItem.candidateName}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                      <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
                        Applied for <strong className="text-[#4A4A4A] dark:text-[#AEB2BB]">{alertItem.jobTitle}</strong> &bull; {alertItem.email}
                      </p>
                    </div>

                    <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                      Entered <strong className="text-[#4A4A4A] dark:text-[#AEB2BB]">{alertItem.stage}</strong> on {enteredDate} (inactive for {alertItem.hoursStalled} hours)
                    </p>
                  </div>

                  {/* Actions: View Application & Dismiss Alert */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E9EE] dark:border-[#262B35] w-full sm:w-auto justify-end">
                    <Link
                      to={`/applications/${alertItem.applicationId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB] dark:bg-[#15181E] hover:bg-[#E7E9EE] dark:hover:bg-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
                    >
                      <span>View Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDismiss(alertItem)}
                      disabled={isDismissing || dismissMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
                      title="Dismiss alert for candidate's current stage"
                    >
                      {isDismissing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Dismissing...</span>
                        </>
                      ) : (
                        <span>Dismiss Alert</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
