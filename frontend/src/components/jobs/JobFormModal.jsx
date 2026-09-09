import { useState, useEffect } from 'react';
import { X, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import { useCreateJob, useUpdateJob } from '../../hooks/useJobs.js';

const JobFormContent = ({ initialJob, onClose, onSuccess }) => {
  const isEditMode = Boolean(initialJob?.id);

  const [formData, setFormData] = useState({
    title: initialJob?.title || '',
    department: initialJob?.department || '',
    description: initialJob?.description || '',
    status: initialJob?.status || 'Open',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const isSubmitting = createJobMutation.isPending || updateJobMutation.isPending;

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
    const trimmedTitle = formData.title.trim();
    const trimmedDept = formData.department.trim();
    const trimmedDesc = formData.description.trim();

    if (!trimmedTitle) {
      errors.title = 'Job title is required.';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'Job title must be at least 3 characters.';
    } else if (trimmedTitle.length > 100) {
      errors.title = 'Job title cannot exceed 100 characters.';
    }

    if (!trimmedDept) {
      errors.department = 'Department is required.';
    } else if (trimmedDept.length < 2) {
      errors.department = 'Department must be at least 2 characters.';
    } else if (trimmedDept.length > 50) {
      errors.department = 'Department cannot exceed 50 characters.';
    }

    if (!trimmedDesc) {
      errors.description = 'Job description is required.';
    } else if (trimmedDesc.length < 10) {
      errors.description = 'Job description must be at least 10 characters.';
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
      title: formData.title.trim(),
      department: formData.department.trim(),
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      if (isEditMode) {
        const updated = await updateJobMutation.mutateAsync({
          id: initialJob.id,
          data: payload,
        });
        if (onSuccess) onSuccess(updated);
      } else {
        const created = await createJobMutation.mutateAsync(payload);
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save job opening. Please check your inputs and try again.';
      setApiError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-form-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-2xl p-6 sm:p-7 relative transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="job-form-title"
                className="text-base sm:text-lg font-heading font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                {isEditMode ? 'Edit Job Opening' : 'Post New Job Opening'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
                {isEditMode
                  ? 'Update role specifications and recruitment status'
                  : 'Define role details to publish an open position'}
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
          {/* Job Title */}
          <div>
            <label
              htmlFor="job-title-input"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Job Title <span className="text-[#C0392B]">*</span>
            </label>
            <input
              id="job-title-input"
              name="title"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                fieldErrors.title
                  ? 'border-[#C0392B] focus:ring-[#C0392B]'
                  : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
              }`}
            />
            {fieldErrors.title && (
              <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Department & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="job-dept-input"
                className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
              >
                Department <span className="text-[#C0392B]">*</span>
              </label>
              <input
                id="job-dept-input"
                name="department"
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Engineering, Product"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                  fieldErrors.department
                    ? 'border-[#C0392B] focus:ring-[#C0392B]'
                    : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
                }`}
              />
              {fieldErrors.department && (
                <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                  {fieldErrors.department}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="job-status-input"
                className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
              >
                Status
              </label>
              <select
                id="job-status-input"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                {isEditMode && <option value="Archived">Archived</option>}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="job-desc-input"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Job Description <span className="text-[#C0392B]">*</span>
            </label>
            <textarea
              id="job-desc-input"
              name="description"
              rows={5}
              required
              placeholder="Outline role responsibilities, required qualifications, team mission, and expectations..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] leading-relaxed transition-colors focus:outline-none focus:ring-2 ${
                fieldErrors.description
                  ? 'border-[#C0392B] focus:ring-[#C0392B]'
                  : 'border-[#E7E9EE] dark:border-[#262B35] focus:ring-[#1E6FF0]'
              }`}
            />
            {fieldErrors.description ? (
              <p className="text-[11px] text-[#C0392B] dark:text-[#F87171] mt-1">
                {fieldErrors.description}
              </p>
            ) : (
              <p className="text-[11px] text-[#6B7280] dark:text-[#7E8494] mt-1">
                Minimum 10 characters. Plain text or markdown formatted.
              </p>
            )}
          </div>

          {/* Action Footer */}
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
              <span>{isEditMode ? 'Save Changes' : 'Post Opening'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const JobFormModal = ({ isOpen, onClose, initialJob = null, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <JobFormContent
      key={initialJob?.id || 'new'}
      initialJob={initialJob}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
