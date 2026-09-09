import { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { useSubmitFeedback } from '../../hooks/useReviews.js';

export const FeedbackForm = ({ applicationId, onFeedbackSubmitted }) => {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const submitMutation = useSubmitFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 3) {
      setError('Feedback content must be at least 3 characters long.');
      return;
    }

    if (trimmed.length > 10000) {
      setError('Feedback content must not exceed 10,000 characters.');
      return;
    }

    const payload = {
      content: trimmed,
      ...(score > 0 ? { score } : {}),
    };

    try {
      await submitMutation.mutateAsync({ applicationId, payload });
      setSuccessMsg('Feedback submitted successfully! Your evaluation has been logged to the audit trail.');
      setContent('');
      setScore(0);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit feedback. Please try again.';
      setError(msg);
    }
  };

  const scoreLabels = {
    1: '1 - Poor (Strong No Hire)',
    2: '2 - Below Average (Lean No Hire)',
    3: '3 - Average (Neutral / Meets Expectations)',
    4: '4 - Good (Lean Hire)',
    5: '5 - Excellent (Strong Hire)',
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#E7E9EE] dark:border-[#262B35]">
        <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5]">
            Submit Interview Feedback & Scorecard
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
            Provide your comprehensive evaluation and optional 1–5 performance score for this candidate.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.12)] border border-[#FECACA] dark:border-[#7F1D1D] text-[#C0392B] dark:text-[#F87171] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#E8F8F2] dark:bg-[rgba(29,158,117,0.12)] border border-[#A7F3D0] dark:border-[#065F46] text-[#1D9E75] dark:text-[#34D399] text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating Score Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] mb-2">
            Assessment Score (Optional, 1–5 scale)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#F5F7FB] dark:bg-[#15181E] p-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35]">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setScore(val === score ? 0 : val)}
                  onMouseEnter={() => setHoverScore(val)}
                  onMouseLeave={() => setHoverScore(0)}
                  disabled={submitMutation.isPending}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
                  title={`Rate ${val} stars`}
                  aria-label={`Score ${val}`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      val <= (hoverScore || score)
                        ? 'text-[#BA7517] dark:text-[#FBBF24] fill-[#BA7517] dark:fill-[#FBBF24]'
                        : 'text-[#D1D5DB] dark:text-[#4B5563]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-[#6B7280] dark:text-[#7E8494]">
              {score > 0
                ? scoreLabels[score]
                : 'Click a star to assign an evaluation rating'}
            </span>
          </div>
        </div>

        {/* Feedback Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="interviewer-content"
              className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]"
            >
              Evaluation Notes & Scorecard Summary <span className="text-[#C0392B]">*</span>
            </label>
            <span
              className={`text-[11px] ${
                content.length > 10000
                  ? 'text-[#C0392B] font-bold'
                  : 'text-[#6B7280] dark:text-[#7E8494]'
              }`}
            >
              {content.length.toLocaleString()} / 10,000 chars
            </span>
          </div>
          <textarea
            id="interviewer-content"
            rows={5}
            required
            disabled={submitMutation.isPending}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your structured feedback, technical competency assessment, strengths, and areas for improvement..."
            className="w-full px-4 py-3 rounded-xl bg-[#F5F7FB] dark:bg-[#15181E] border border-[#E7E9EE] dark:border-[#262B35] text-xs sm:text-sm text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#1E6FF0] focus:ring-2 focus:ring-[#1E6FF0]/20 transition-all resize-y min-h-[120px]"
          />
          <p className="mt-1.5 text-[11px] text-[#6B7280] dark:text-[#7E8494]">
            Minimum 3 characters required. Submitting logs your feedback directly to the candidate&apos;s evaluation audit trail.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitMutation.isPending || content.trim().length < 3}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1557c0] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2"
          >
            {submitMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Scorecard...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Scorecard</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
