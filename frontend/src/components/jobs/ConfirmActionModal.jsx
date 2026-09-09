import { useEffect } from 'react';
import { AlertTriangle, Archive, RefreshCw, X } from 'lucide-react';

export const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary' | 'warning'
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  let confirmBtnClasses =
    'bg-[#C0392B] hover:bg-[#A93226] text-white focus:ring-[#C0392B]';
  let iconBg = 'bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B]';
  let IconComponent = Archive;

  if (variant === 'primary') {
    confirmBtnClasses =
      'bg-[#1E6FF0] hover:bg-[#1656C2] text-white focus:ring-[#1E6FF0]';
    iconBg = 'bg-[#EDF3FE] dark:bg-[rgba(30,111,240,0.15)] text-[#1E6FF0]';
    IconComponent = RefreshCw;
  } else if (variant === 'warning') {
    confirmBtnClasses =
      'bg-[#BA7517] hover:bg-[#9B6012] text-white focus:ring-[#BA7517]';
    iconBg = 'bg-[#FEF7E6] dark:bg-[rgba(186,117,23,0.15)] text-[#BA7517]';
    IconComponent = AlertTriangle;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-xl p-6 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] dark:text-[#7E8494] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${iconBg}`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3
              id="confirm-modal-title"
              className="text-base font-heading font-semibold text-[#111111] dark:text-[#F2F3F5] mb-2"
            >
              {title}
            </h3>
            <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-[#E7E9EE] dark:border-[#262B35]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-50 ${confirmBtnClasses}`}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
