import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
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
  const [imgLoadError, setImgLoadError] = useState(false);

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
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200 w-full py-2 sm:py-3">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shrink-0">
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

      {/* Main Authentication Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-4 w-full min-h-0 overflow-hidden">
        {/* Responsive Outer Container: Automatically adjusts to 420px on mobile and short screens */}
        <div className="login-card-container w-full max-w-[420px] md:max-w-5xl lg:max-w-6xl xl:max-w-[1140px] mx-auto flex items-center justify-center transition-all duration-200">
          {/* Cohesive Rounded Authentication Card */}
          <div className="w-full max-h-full bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-colors duration-200">
            <div className="flex flex-col md:flex-row md:min-h-[490px] lg:min-h-[530px]">
              
              {/* Left Column: Side Panel (hidden on mobile and short screens) */}
              <div className="login-side-panel hidden md:flex md:w-[48%] lg:w-[50%] border-b md:border-b-0 md:border-r border-[#E7E9EE] dark:border-[#262B35] relative overflow-hidden">
                <div className="h-full min-h-[490px] lg:min-h-[530px] flex flex-col justify-between p-6 lg:p-9 relative overflow-hidden bg-gradient-to-br from-[#EDF3FE] via-[#F4F7FE] to-[#E5EFFF] dark:from-[#15181E] dark:via-[#181C24] dark:to-[#13161C] w-full min-w-[340px] md:min-w-[380px] lg:min-w-[420px]">
                  {/* Background Ambient Glows */}
                  <div 
                    className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#1E6FF0]/10 dark:bg-[#1E6FF0]/15 blur-3xl pointer-events-none" 
                    aria-hidden="true" 
                  />
                  <div 
                    className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 blur-3xl pointer-events-none" 
                    aria-hidden="true" 
                  />

                  {/* Top Branding Strip */}
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 dark:bg-[#1E222B]/90 border border-[#E7E9EE] dark:border-[#262B35] text-[11px] font-semibold text-[#1E6FF0] shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Recruitment Operations Platform</span>
                    </div>

                    <h2 className="font-heading font-bold text-2xl lg:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight mt-3 leading-tight">
                      Streamline hiring. <br />
                      <span className="text-[#1E6FF0]">Empower teams.</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1.5 leading-relaxed max-w-sm">
                      Collaborative candidate evaluation, automated interview workflows, and real-time hiring metrics.
                    </p>
                  </div>

                  {/* Center: Hero Illustration */}
                  <div className="relative z-10 my-4 lg:my-6 flex items-center justify-center">
                    <div className="w-full max-w-[420px] lg:max-w-[460px] flex items-center justify-center">
                      {!imgLoadError ? (
                        <img
                          src="/login-hero.webp"
                          alt="HireStream talent pipeline – candidate profiles flowing through a hiring funnel"
                          className="w-full h-auto rounded-2xl object-cover shadow-lg pointer-events-none"
                          onError={() => setImgLoadError(true)}
                          loading="eager"
                        />
                      ) : (
                        /* Graceful Fallback */
                        <div className="w-full rounded-xl p-5 bg-white/70 dark:bg-[#1C202A]/80 border border-[#E7E9EE] dark:border-[#262B35] flex flex-col justify-center gap-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#1E6FF0]/10 flex items-center justify-center text-[#1E6FF0]">
                              <Users className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#111111] dark:text-[#F2F3F5]">Collaborative Hiring</div>
                              <div className="text-xs text-[#6B7280] dark:text-[#7E8494]">Candidate Scorecards &amp; Velocity</div>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-[#EDF3FE] dark:bg-[#262B35] rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-[#1E6FF0] rounded-full" />
                          </div>
                          <div className="text-xs text-[#1D9E75] font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Panel Consensus: Ready to Advance</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Value Highlights */}
                  <div className="relative z-10 pt-3 border-t border-[#E7E9EE]/80 dark:border-[#262B35]/80 grid grid-cols-2 gap-2.5 text-xs text-[#4A4A4A] dark:text-[#AEB2BB]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6FF0] shrink-0" aria-hidden="true" />
                      <span>Real-time Pipeline SLA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1E6FF0] shrink-0" aria-hidden="true" />
                      <span>Role-Based Security</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Entry Login Box */}
              <div className="w-full md:w-[52%] lg:w-[50%] flex flex-col justify-center p-6 sm:p-8 lg:p-11 bg-white dark:bg-[#1A1D24] overflow-y-auto">
                <div className="max-w-[380px] w-full mx-auto">
                  {/* Form Header */}
                  <div className="mb-5 sm:mb-6 text-left">
                    <div className="w-9 h-9 rounded-xl bg-[#1E6FF0]/10 dark:bg-[#1E6FF0]/20 flex items-center justify-center text-[#1E6FF0] font-bold text-base shadow-xs mb-3">
                      H
                    </div>

                    <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
                      Welcome Back
                    </h1>
                    <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1 leading-relaxed">
                      Sign in to continue to your HireStream workspace.
                    </p>
                  </div>

                  {/* Error Alert Banner */}
                  {errorMessage && (
                    <div
                      role="alert"
                      className="mb-4 p-3 rounded-[10px] bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-xs font-medium flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  {/* Authentication Form */}
                  <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
                    {/* Work Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB] mb-1"
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
                            w-full text-sm rounded-[10px] pl-10 pr-3.5 py-2 sm:py-2.5 outline-none transition-colors duration-150
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
                        <p id="email-error" role="alert" className="mt-1 text-xs text-[#C0392B] font-medium">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB] mb-1"
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
                            w-full text-sm rounded-[10px] pl-10 pr-10 py-2 sm:py-2.5 outline-none transition-colors duration-150
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
                        <p id="password-error" role="alert" className="mt-1 text-xs text-[#C0392B] font-medium">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1.5 sm:pt-2">
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
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-2 text-center shrink-0">
        <p className="text-[11px] sm:text-xs text-[#6B7280] dark:text-[#7E8494]">
          &copy; {new Date().getFullYear()} HireStream. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
