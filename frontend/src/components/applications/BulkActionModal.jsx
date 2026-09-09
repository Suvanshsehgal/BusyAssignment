import { useState, useEffect } from 'react';
import {
  X,
  FastForward,
  UserX,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useBulkAdvance, useBulkReject } from '../../hooks/useApplications.js';

const BulkActionModalContent = ({
  onClose,
  action, // 'advance' | 'reject'
  selectedApplications = [], // Array of application objects
  onSuccess,
}) => {
  const [reasonOrNotes, setReasonOrNotes] = useState('');
  const [bulkResult, setBulkResult] = useState(null); // { succeeded_count, failed_count, successful, failed }
  const [errorMessage, setErrorMessage] = useState('');

  const bulkAdvanceMutation = useBulkAdvance();
  const bulkRejectMutation = useBulkReject();
  const isSubmitting = bulkAdvanceMutation.isPending || bulkRejectMutation.isPending;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const isAdvance = action === 'advance';
  const applicationIds = selectedApplications.map((a) => a.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      let res;
      if (isAdvance) {
        res = await bulkAdvanceMutation.mutateAsync({
          applicationIds,
          notes: reasonOrNotes.trim() || undefined,
        });
      } else {
        res = await bulkRejectMutation.mutateAsync({
          applicationIds,
          reason: reasonOrNotes.trim() || undefined,
        });
      }
      setBulkResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Failed to execute bulk operation. Please try again.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-action-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-2xl p-6 sm:p-7 relative transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isAdvance
                  ? 'bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]'
                  : 'bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B]'
              }`}
            >
              {isAdvance ? <FastForward className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
            </div>
            <div>
              <h2
                id="bulk-action-title"
                className="text-base sm:text-lg font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                {isAdvance ? 'Bulk Advance Applications' : 'Bulk Reject Applications'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
                Targeting {selectedApplications.length}{' '}
                {selectedApplications.length === 1 ? 'candidate' : 'candidates'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If results received, display independent breakdown */}
        {bulkResult ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs">
              <div className="flex items-center gap-1.5 text-[#1D9E75] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{bulkResult.succeeded_count} Succeeded</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#C0392B] font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{bulkResult.failed_count} Refused / Failed</span>
              </div>
            </div>

            {/* List of individual results */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {(bulkResult.results || []).map((item) => {
                const app = selectedApplications.find((a) => a.id === item.id);
                const candidateName = app?.candidateName || `ID: ${item.id.slice(0, 8)}...`;
                const isSuccess = item.status === 'success';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      isSuccess
                        ? 'bg-[#E8F8F2]/60 dark:bg-[rgba(29,158,117,0.1)] border-[#A7F3D0] dark:border-[#065F46]'
                        : 'bg-[#FDF2F1]/60 dark:bg-[rgba(192,57,43,0.1)] border-[#FECACA] dark:border-[#7F1D1D]'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#C0392B] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <strong className="block text-[#111111] dark:text-[#F2F3F5] truncate">
                          {candidateName}
                        </strong>
                        <span className="text-[11px] text-[#4A4A4A] dark:text-[#AEB2BB] block mt-0.5">
                          {isSuccess
                            ? `Moved to stage: ${item.newStage || item.application?.stage}`
                            : item.reason || 'Action refused by backend rules'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#1E6FF0] text-white text-xs font-semibold hover:bg-[#1656C2] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation & Execution Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs space-y-1.5">
              <p className="text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed">
                {isAdvance
                  ? 'Each selected candidate will be processed independently according to sequential pipeline progression rules. Candidates at terminal or incompatible stages will be cleanly reported with refusal reasons.'
                  : 'Selected candidates will be transitioned to the Rejected stage. Their previous stages will be recorded for historical tracking and reinstatement eligibility.'}
              </p>
            </div>

            <div>
              <label
                htmlFor="bulk-reason-input"
                className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
              >
                {isAdvance ? 'Transition Notes (Optional)' : 'Rejection Reason (Optional)'}
              </label>
              <textarea
                id="bulk-reason-input"
                rows={2}
                placeholder={
                  isAdvance
                    ? 'e.g. Batch advanced after screening review meeting...'
                    : 'e.g. Role requirements filled or insufficient technical alignment...'
                }
                value={reasonOrNotes}
                onChange={(e) => setReasonOrNotes(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
              />
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t border-[#E7E9EE] dark:border-[#262B35]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                  isAdvance
                    ? 'bg-[#1E6FF0] hover:bg-[#1656C2] focus:ring-[#1E6FF0]'
                    : 'bg-[#C0392B] hover:bg-[#A93226] focus:ring-[#C0392B]'
                }`}
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isAdvance
                    ? `Advance ${selectedApplications.length} Candidates`
                    : `Reject ${selectedApplications.length} Candidates`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const BulkActionModal = ({
  isOpen,
  onClose,
  action,
  selectedApplications = [],
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <BulkActionModalContent
      key={action + selectedApplications.length}
      onClose={onClose}
      action={action}
      selectedApplications={selectedApplications}
      onSuccess={onSuccess}
    />
  );
};
