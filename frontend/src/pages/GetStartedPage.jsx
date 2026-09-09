import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import {
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const GetStartedPage = () => {
  const navigate = useNavigate();
  const [recruiterImgError, setRecruiterImgError] = useState(false);
  const [interviewerImgError, setInterviewerImgError] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden flex flex-col justify-between bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-[#1E6FF0] flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-heading font-bold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
            Hire<span className="text-[#1E6FF0]">Stream</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-white dark:hover:bg-[#1A1D24] hover:text-[#111111] dark:hover:text-[#F2F3F5] px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content - Scrollable on mobile, single-screen on desktop */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-2 lg:py-4 flex flex-col justify-start md:justify-evenly items-center md:overflow-hidden">
        {/* Hero Welcome Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-0 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] mb-2.5 border border-[#1E6FF0]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Recruitment Platform</span>
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111111] dark:text-[#F2F3F5] tracking-tight leading-tight mb-2">
            Welcome to <span className="text-[#1E6FF0]">HireStream</span>
          </h1>
          {/* <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] max-w-xl mx-auto leading-relaxed">
            HireStream helps recruitment teams manage hiring, interviews, candidates, and hiring decisions efficiently.
          </p> */}
        </div>

        {/* Informational Role Cards (Stacked on mobile, 2-cols on desktop) */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-6 lg:gap-8 mb-8 md:mb-0 shrink-0">
          {/* Recruiter Card */}
          <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-xl overflow-hidden shadow-sm flex flex-col transition-colors duration-200">
            {/* Animated Image */}
            <div className="w-full h-44 sm:h-48 md:h-32 lg:h-36 bg-[#EDF3FE] dark:bg-[#212836] relative overflow-hidden shrink-0">
              {!recruiterImgError ? (
                <img
                  src="/recruiter-animated.svg"
                  alt="Recruiter managing hiring workflow"
                  loading="eager"
                  onError={() => setRecruiterImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1E6FF0]">
                  <Briefcase className="w-10 h-10 stroke-1" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-md bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5]">
                    Recruiter
                  </h2>
                </div>

                <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-3 leading-relaxed">
                  Coordinate hiring pipelines and candidate progression.
                </p>
              </div>

              <div className="border-t border-[#E7E9EE] dark:border-[#262B35] pt-3 mt-auto">
                <ul className="space-y-2 text-xs text-[#4A4A4A] dark:text-[#AEB2BB]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>Manage and publish job openings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>Advance candidates across pipeline stages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>Assign interview panels and track SLAs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interviewer Card */}
          <div className="bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] rounded-xl overflow-hidden shadow-sm flex flex-col transition-colors duration-200">
            {/* Animated Image */}
            <div className="w-full h-44 sm:h-48 md:h-32 lg:h-36 bg-[#EDF3FE] dark:bg-[#212836] relative overflow-hidden shrink-0">
              {!interviewerImgError ? (
                <img
                  src="/interviewer-animated.svg"
                  alt="Interviewer conducting candidate evaluation"
                  loading="eager"
                  onError={() => setInterviewerImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1E6FF0]">
                  <Users className="w-10 h-10 stroke-1" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-md bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5]">
                    Interviewer
                  </h2>
                </div>

                <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-3 leading-relaxed">
                  Evaluate assigned candidates and submit scorecards.
                </p>
              </div>

              <div className="border-t border-[#E7E9EE] dark:border-[#262B35] pt-3 mt-auto">
                <ul className="space-y-2 text-xs text-[#4A4A4A] dark:text-[#AEB2BB]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>View assigned candidate review queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>Conduct structured competency assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <span>Submit ratings, notes, and recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Single Primary Action at the Bottom / Center */}
        <div className="flex flex-col items-center gap-2 mb-6 md:mb-0 shrink-0">
          <button
            type="button"
            onClick={handleGetStarted}
            className="rounded-full bg-[#1E6FF0] text-white hover:bg-[#1656C2] active:bg-[#1249A8] font-medium text-sm sm:text-base py-2.5 px-8 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E6FF0] shadow-sm flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-[#6B7280] dark:text-[#7E8494]">
            Your access permissions are determined automatically upon sign in.
          </p>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="border-t border-[#E7E9EE] dark:border-[#262B35] py-2.5 px-4 text-center text-xs text-[#6B7280] dark:text-[#7E8494] select-none shrink-0">
        &copy; {new Date().getFullYear()} HireStream. All rights reserved.
      </footer>
    </div>
  );
};

