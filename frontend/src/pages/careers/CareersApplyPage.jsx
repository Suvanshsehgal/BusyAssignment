import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Send,
  AlertCircle,
  CheckCircle2,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';
import { usePublicJob, useSubmitPublicApplication } from '../../hooks/useCareers.js';

export const CareersApplyPage = () => {
  const { jobId } = useParams();
  const { data: job, isLoading: isJobLoading, isError: isJobError, error: jobError } = usePublicJob(jobId);

  // Form inputs strictly matching backend: candidateName, email, notes
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Validation & feedback state
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);

  const submitMutation = useSubmitPublicApplication();

  const validateForm = () => {
    const errors = {};

    const trimmedName = candidateName.trim();
    if (!trimmedName) {
      errors.candidateName = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.candidateName = 'Full name must be at least 2 characters long.';
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address (e.g. name@example.com).';
    }

    if (notes.length > 5000) {
      errors.notes = 'Cover note must not exceed 5,000 characters.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      const result = await submitMutation.mutateAsync({
        jobId,
        candidateName: candidateName.trim(),
        email: email.trim().toLowerCase(),
        notes: notes.trim() || undefined,
      });

      setSubmittedApp(result || { candidateName, email });
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while submitting your application.';

      if (status === 409) {
        setServerError('You have already submitted an application for this position with this email address.');
      } else if (status === 404) {
        setServerError('This job opening is no longer available or has been removed.');
      } else if (status === 429) {
        setServerError('Too many application attempts. Please wait a few moments before trying again.');
      } else {
        setServerError(message);
      }
    }
  };

  // Loading Job Metadata
  if (isJobLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-28 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
        <div className="h-96 bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E7E9EE] dark:border-[#262B35]" />
      </div>
    );
  }

  // Job Error or Closed
  if (isJobError || !job || job.status !== 'Open') {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-semibold text-lg text-[#111111] dark:text-[#F2F3F5]">
          Applications Unavailable
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#7E8494] leading-relaxed">
          {job?.status !== 'Open'
            ? 'This position is currently closed and is no longer accepting new applications.'
            : jobError?.response?.data?.message ||
              jobError?.message ||
              'This position could not be found or is not open for applications.'}
        </p>
        <div className="pt-2">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Available Positions</span>
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation / Success State
  if (submittedApp) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.15)] text-[#1D9E75] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
            Application Received
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Thank you for applying!
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#7E8494] max-w-md mx-auto leading-relaxed">
            Your application for <span className="font-semibold text-[#111111] dark:text-[#F2F3F5]">{job.title}</span> has been submitted to the HireStream team.
          </p>
        </div>

        {/* Safe Confirmation Card */}
        <div className="p-5 rounded-2xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#262B35] text-xs">
            <span className="font-medium text-[#6B7280] dark:text-[#7E8494]">Position</span>
            <span className="font-semibold text-[#111111] dark:text-[#F2F3F5] text-right truncate max-w-[200px]">
              {job.title}
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E9EE] dark:border-[#262B35] text-xs">
            <span className="font-medium text-[#6B7280] dark:text-[#7E8494]">Department</span>
            <span className="font-semibold text-[#111111] dark:text-[#F2F3F5]">
              {job.department || 'Engineering'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#6B7280] dark:text-[#7E8494]">Confirmation Sent To</span>
            <span className="font-semibold text-[#111111] dark:text-[#F2F3F5] truncate max-w-[200px]">
              {email}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#EDF3FE] dark:bg-[#1A2332] text-xs text-[#1E6FF0] dark:text-[#93C5FD] flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Our recruiting panel will review your submission and contact you via email if your profile matches the role requirements.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/careers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Careers Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      {/* Back Link */}
      <div>
        <Link
          to={`/careers/${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-[#7E8494] hover:text-[#1E6FF0] dark:hover:text-[#1E6FF0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Details</span>
        </Link>
      </div>

      {/* Target Job Summary Header */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5F7FB] dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] border border-[#E7E9EE] dark:border-[#262B35] mb-2">
            <Building2 className="w-3 h-3 text-[#6B7280] dark:text-[#7E8494]" />
            <span>{job.department || 'Engineering'}</span>
          </span>
          <h1 className="font-heading font-bold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Apply for: {job.title}
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Public Candidate Application &bull; No Login Required
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#1D9E75] font-semibold self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
          <span>Accepting Applications</span>
        </div>
      </div>

      {/* Application Form Card */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h2 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            Candidate Information
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            Please fill out your contact details. All fields marked with an asterisk (<span className="text-[#C0392B]">*</span>) are required.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Submission Error</span>
              <p className="leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Candidate Full Name */}
          <div>
            <label
              htmlFor="candidateName"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Full Name <span className="text-[#C0392B]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                id="candidateName"
                type="text"
                required
                disabled={submitMutation.isPending}
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  if (clientErrors.candidateName) {
                    setClientErrors((prev) => ({ ...prev, candidateName: null }));
                  }
                }}
                placeholder="e.g. Alex Morgan"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border ${
                  clientErrors.candidateName
                    ? 'border-[#C0392B] dark:border-[#F87171] focus:ring-[#C0392B]/20'
                    : 'border-[#E7E9EE] dark:border-[#262B35] focus:border-[#1E6FF0] focus:ring-[#1E6FF0]/20'
                } text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {clientErrors.candidateName && (
              <p className="mt-1 text-[11px] text-[#C0392B] dark:text-[#F87171] font-medium">
                {clientErrors.candidateName}
              </p>
            )}
          </div>

          {/* Candidate Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-1.5"
            >
              Email Address <span className="text-[#C0392B]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                id="email"
                type="email"
                required
                disabled={submitMutation.isPending}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) {
                    setClientErrors((prev) => ({ ...prev, email: null }));
                  }
                }}
                placeholder="e.g. alex.morgan@example.com"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border ${
                  clientErrors.email
                    ? 'border-[#C0392B] dark:border-[#F87171] focus:ring-[#C0392B]/20'
                    : 'border-[#E7E9EE] dark:border-[#262B35] focus:border-[#1E6FF0] focus:ring-[#1E6FF0]/20'
                } text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {clientErrors.email ? (
              <p className="mt-1 text-[11px] text-[#C0392B] dark:text-[#F87171] font-medium">
                {clientErrors.email}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#7E8494]">
                We will use this address to contact you regarding interview scheduling and updates.
              </p>
            )}
          </div>

          {/* Optional Notes / Cover Letter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="notes"
                className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]"
              >
                Cover Note / Message <span className="text-[#6B7280] dark:text-[#7E8494] font-normal">(Optional)</span>
              </label>
              <span
                className={`text-[11px] ${
                  notes.length > 5000
                    ? 'text-[#C0392B] font-bold'
                    : 'text-[#6B7280] dark:text-[#7E8494]'
                }`}
              >
                {notes.length.toLocaleString()} / 5,000 chars
              </span>
            </div>
            <textarea
              id="notes"
              rows={4}
              disabled={submitMutation.isPending}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Introduce yourself, share links to your portfolio/GitHub/LinkedIn, or outline your relevant experience..."
              className="w-full px-4 py-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#1E6FF0] focus:ring-2 focus:ring-[#1E6FF0]/20 transition-all resize-y min-h-[100px]"
            />
            {clientErrors.notes && (
              <p className="mt-1 text-[11px] text-[#C0392B] dark:text-[#F87171] font-medium">
                {clientErrors.notes}
              </p>
            )}
          </div>

          {/* Frictionless Transparency Notice */}
          <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] flex items-center gap-2.5 text-[11px] text-[#6B7280] dark:text-[#7E8494]">
            <ShieldCheck className="w-4 h-4 text-[#1D9E75] shrink-0" />
            <span>
              By submitting, your application is directly filed under the <strong className="text-[#111111] dark:text-[#F2F3F5]">Applied</strong> pipeline stage for hiring team review.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Link
              to={`/careers/${job.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
