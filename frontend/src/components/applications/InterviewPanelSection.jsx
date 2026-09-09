import { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAssignPanel, useRemovePanelMember } from '../../hooks/useApplications.js';

export const InterviewPanelSection = ({ applicationId, panel = [], allApplications = [] }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [apiError, setApiError] = useState('');

  const assignMutation = useAssignPanel();
  const removeMutation = useRemovePanelMember();
  const isPending = assignMutation.isPending || removeMutation.isPending;

  // Dynamically collect any interviewers discovered from panel members across all applications
  const discoveredInterviewers = new Map();
  (allApplications || []).forEach((app) => {
    (app.interviewPanels || []).forEach((p) => {
      if (p.user?.id) {
        discoveredInterviewers.set(p.user.id, p.user);
      }
    });
  });
  // Also include currently assigned panel members
  panel.forEach((p) => {
    if (p.user?.id) {
      discoveredInterviewers.set(p.user.id, p.user);
    }
  });

  const availableInterviewersList = Array.from(discoveredInterviewers.values());

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setApiError('Please select or specify an interviewer user ID.');
      return;
    }

    setApiError('');
    try {
      await assignMutation.mutateAsync({
        id: applicationId,
        payload: {
          userId: selectedUserId,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        },
      });
      setIsAssignModalOpen(false);
      setSelectedUserId('');
      setScheduledAt('');
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          'Failed to assign interviewer to panel.'
      );
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Are you sure you want to remove this interviewer from the panel?')) {
      try {
        await removeMutation.mutateAsync({ id: applicationId, userId });
      } catch (err) {
        alert(
          err.response?.data?.message ||
            err.message ||
            'Failed to remove interviewer from panel.'
        );
      }
    }
  };

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
              Interview Panel ({panel.length})
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
              Designate authorized interviewers to evaluate this candidate and submit scorecards.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setApiError('');
            setIsAssignModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Assign Interviewer</span>
        </button>
      </div>

      {/* Panel Members List */}
      {panel.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
            No Interviewers Assigned
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] max-w-xs mx-auto mt-1">
            Assign one or more interviewers so they can view this candidate in their review portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {panel.map((member) => {
            const user = member.user || {};
            const scheduledDate = member.scheduledAt
              ? new Date(member.scheduledAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : null;

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/50 dark:bg-[#15181E] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] truncate">
                      {user.name || 'Assigned Interviewer'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] truncate">
                      {user.email || member.userId}
                    </p>
                    {scheduledDate && (
                      <div className="flex items-center gap-1 text-[10px] text-[#1E6FF0] mt-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>Scheduled: {scheduledDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(member.userId)}
                  disabled={isPending}
                  title="Remove interviewer from panel"
                  className="p-2 rounded-lg text-[#C0392B] hover:bg-[#FDF2F1] dark:hover:bg-[rgba(192,57,43,0.15)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C0392B] cursor-pointer disabled:opacity-50"
                  aria-label={`Remove ${user.name || 'interviewer'} from panel`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-interviewer-title"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#262B35]">
              <h3
                id="assign-interviewer-title"
                className="text-base font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                Assign Panel Interviewer
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="mt-3 p-3 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleAssign} className="mt-4 space-y-4 text-xs">
              <div>
                <label
                  htmlFor="interviewer-select"
                  className="block font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
                >
                  Select Interviewer <span className="text-[#C0392B]">*</span>
                </label>
                {availableInterviewersList.length > 0 ? (
                  <select
                    id="interviewer-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:ring-2 focus:ring-[#1E6FF0] focus:outline-none"
                  >
                    <option value="">-- Choose an interviewer --</option>
                    {availableInterviewersList.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      id="interviewer-select"
                      type="text"
                      placeholder="Enter interviewer user UUID (e.g. from seed users)"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:ring-2 focus:ring-[#1E6FF0] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#6B7280] dark:text-[#7E8494] mt-1">
                      Seed interviewers: Alex Rivera, Priya Patel, David Kim, Elena Rostova.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="interview-schedule-input"
                  className="block font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
                >
                  Scheduled Interview Date & Time (Optional)
                </label>
                <input
                  id="interview-schedule-input"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:ring-2 focus:ring-[#1E6FF0] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-[#111111] dark:text-[#F2F3F5] font-semibold hover:bg-[#F5F7FB] dark:hover:bg-[#262B35]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white font-semibold flex items-center gap-1.5"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign to Panel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
