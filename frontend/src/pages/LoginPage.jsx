import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth.js';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { getErrorMessage } from '../utils/error.js';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to role-specific landing page
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleHome = user.role === 'recruiter' ? '/dashboard' : '/my-reviews';
      navigate(roleHome, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const verifiedUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      const roleHome = verifiedUser?.role === 'recruiter' ? '/dashboard' : '/my-reviews';
      const fromPath = location.state?.from?.pathname;
      const isAllowedFrom =
        (verifiedUser?.role === 'recruiter' && fromPath && !fromPath.startsWith('/my-reviews')) ||
        (verifiedUser?.role === 'interviewer' && fromPath && fromPath.startsWith('/my-reviews'));

      navigate(isAllowedFrom ? fromPath : roleHome, { replace: true });
    } catch (err) {
      const formattedError = getErrorMessage(
        err,
        'Invalid email or password. Please verify your credentials and try again.'
      );
      setErrorMessage(formattedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormIncomplete = !email.trim() || !password;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-heading font-bold text-lg text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Hire<span className="text-[#1E6FF0]">Stream</span>
          </span>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[420px]">
          {/* Card Container */}
          <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-[10px] p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-colors duration-200">
            {/* Header Text */}
            <div className="mb-6 text-left">
              <h1 className="font-heading font-bold text-2xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mt-1.5 leading-relaxed">
                Enter your work credentials to access your HireStream recruitment portal.
              </p>
            </div>

            {/* Error Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-[10px] bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-xs font-medium flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB] mb-1.5"
                >
                  Work Email <span className="text-[#C0392B]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280] dark:text-[#7E8494]">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    className={`
                      w-full text-sm rounded-[10px] pl-10 pr-3.5 py-2.5 outline-none transition-colors duration-150
                      bg-white dark:bg-[#1A1D24]
                      text-[#111111] dark:text-[#F2F3F5]
                      placeholder-[#6B7280] dark:placeholder-[#7E8494]
                      border
                      ${
                        fieldErrors.email
                          ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                          : 'border-[#E7E9EE] dark:border-[#262B35] focus:border-[#1E6FF0] focus:ring-1 focus:ring-[#1E6FF0]'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-xs text-[#C0392B] font-medium">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB] mb-1.5"
                >
                  Password <span className="text-[#C0392B]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280] dark:text-[#7E8494]">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className={`
                      w-full text-sm rounded-[10px] pl-10 pr-10 py-2.5 outline-none transition-colors duration-150
                      bg-white dark:bg-[#1A1D24]
                      text-[#111111] dark:text-[#F2F3F5]
                      placeholder-[#6B7280] dark:placeholder-[#7E8494]
                      border
                      ${
                        fieldErrors.password
                          ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                          : 'border-[#E7E9EE] dark:border-[#262B35] focus:border-[#1E6FF0] focus:ring-1 focus:ring-[#1E6FF0]'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] dark:text-[#7E8494] hover:text-[#111111] dark:hover:text-[#F2F3F5] transition-colors p-1 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" role="alert" className="mt-1.5 text-xs text-[#C0392B] font-medium">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button (Pill-shaped as defined in design system) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isFormIncomplete}
                  className="w-full rounded-full bg-[#1E6FF0] text-white hover:bg-[#1656C2] active:bg-[#1249A8] font-medium text-sm py-2.5 px-5 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E6FF0] shadow-sm flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-[#6B7280] dark:text-[#7E8494] mt-6 select-none">
            &copy; {new Date().getFullYear()} HireStream. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};
