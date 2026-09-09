import { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, RefreshCw, AlertCircle } from 'lucide-react';
import { useCreateApplication, useUpdateApplication } from '../../hooks/useApplications.js';
import { useJobs } from '../../hooks/useJobs.js';

const COMMON_SOURCES = [
  'LinkedIn',
  'Referral',
  'Careers Page',
  'Direct',
  'GitHub',
  'Agency',
  'Other',
];

const ApplicationFormContent = ({ initialApplication, onClose, onSuccess }) => {
  const isEditMode = Boolean(initialApplication?.id);

  // Fetch available jobs for dropdown
  const { data: jobs, isLoading: isJobsLoading } = useJobs({ includeArchived: 'false' });

  const [formData, setFormData] = useState({
    candidateName: initialApplication?.candidateName || '',
    email: initialApplication?.email || '',
    jobOpeningId: initialApplication?.jobOpeningId || initialApplication?.jobOpening?.id || '',
    source: initialApplication?.source || 'LinkedIn',
    notes: initialApplication?.notes || '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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

  const validate = () => {
    const errors = {};
    const trimmedName = formData.candidateName.trim();
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      errors.candidateName = 'Candidate name is required.';
    } else if (trimmedName.length < 2) {
      errors.candidateName = 'Name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!isEditMode && !formData.jobOpeningId) {
      errors.jobOpeningId = 'Please select a job opening.';
    }

    if (!formData.source) {
      errors.source = 'Application source is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError('');

    const payload = {
      candidateName: formData.candidateName.trim(),
      email: formData.email.trim().toLowerCase(),
      source: formData.source.trim(),
      notes: formData.notes.trim() || undefined,
      jobOpeningId: formData.jobOpeningId,
    };

    try {
      if (isEditMode) {
        const updated = await updateMutation.mutateAsync({
          id: initialApplication.id,
          data: payload,
        });
        if (onSuccess) onSuccess(updated);
      } else {
        const created = await createMutation.mutateAsync(payload);
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save application. Please verify inputs and try again.';
      setApiError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-form-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-2xl p-6 sm:p-7 relative transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2
                id="app-form-title"
                className="text-base sm:text-lg font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                {isEditMode ? 'Edit Candidate Details' : 'Add Candidate Application'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
                {isEditMode
                  ? 'Update candidate information and source details'
                  : 'Manually register an inbound candidate profile into the pipeline'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mt-4 p-3 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] border border-[#FECACA] dark:border-[#7F1D1D] flex items-start gap-2.5 text-[#C0392B] dark:text-[#F87171] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Job Opening */}
          <div>
            <label
              htmlFor="app-job-select"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Target Job Opening <span className="text-[#C0392B]">*</span>
            </label>
            <select
              id="app-job-select"
              name="jobOpeningId"
              value={formData.jobOpeningId}
              onChange={handleChange}
              disabled={isSubmitting || isJobsLoading}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 ${
                fieldErrors.jobOpeningId
                  ? 'border-[#C0392B] focus:ring-[#C0392B]'
                  : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
              }`}
            >
              <option value="">-- Select an active job opening --</option>
              {Array.isArray(jobs) &&
                jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) — {j.status}
                  </option>
                ))}
            </select>
            {fieldErrors.jobOpeningId && (
              <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                {fieldErrors.jobOpeningId}
              </p>
            )}
          </div>

          {/* Candidate Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="candidate-name-input"
                className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
              >
                Candidate Name <span className="text-[#C0392B]">*</span>
              </label>
              <input
                id="candidate-name-input"
                name="candidateName"
                type="text"
                required
                maxLength={100}
                placeholder="e.g. John Doe"
                value={formData.candidateName}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                  fieldErrors.candidateName
                    ? 'border-[#C0392B] focus:ring-[#C0392B]'
                    : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
                }`}
              />
              {fieldErrors.candidateName && (
                <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                  {fieldErrors.candidateName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="candidate-email-input"
                className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
              >
                Email Address <span className="text-[#C0392B]">*</span>
              </label>
              <input
                id="candidate-email-input"
                name="email"
                type="email"
                required
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-[#C0392B] focus:ring-[#C0392B]'
                    : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Source */}
          <div>
            <label
              htmlFor="candidate-source-select"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Application Source <span className="text-[#C0392B]">*</span>
            </label>
            <select
              id="candidate-source-select"
              name="source"
              value={formData.source}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              {COMMON_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Recruiter Notes */}
          <div>
            <label
              htmlFor="candidate-notes-input"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Recruiter Notes <span className="text-[11px] font-normal text-[#6B7280]">(Optional)</span>
            </label>
            <textarea
              id="candidate-notes-input"
              name="notes"
              rows={3}
              placeholder="Add initial recruiter screening observations, portfolio links, or compensation expectations..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            />
          </div>

          {/* Footer Buttons */}
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditMode ? 'Save Changes' : 'Create Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ApplicationFormModal = ({ isOpen, onClose, initialApplication = null, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <ApplicationFormContent
      key={initialApplication?.id || 'new'}
      initialApplication={initialApplication}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
