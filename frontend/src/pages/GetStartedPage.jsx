import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import {
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';

export const GetStartedPage = () => {
  const navigate = useNavigate();
  const [recruiterImgError, setRecruiterImgError] = useState(false);
  const [interviewerImgError, setInterviewerImgError] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden flex flex-col justify-between bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200 relative select-none">
      {/* Ambient Aurora Glow (Top Center) */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-[#1E6FF0]/15 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true" 
      />

      {/* Top Glassmorphic Navigation Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E6FF0] to-[#3B82F6] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-[#1E6FF0]/25">
            H
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg sm:text-xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              Hire<span className="text-[#1E6FF0]">Stream</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1E6FF0]/10 text-[#1E6FF0] border border-[#1E6FF0]/20">
              v2.0
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
         

          <ThemeToggle />

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#111111] dark:text-[#F2F3F5] hover:border-[#1E6FF0] hover:text-[#1E6FF0] px-4 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-2 lg:py-3 flex flex-col justify-start md:justify-evenly items-center md:overflow-hidden relative z-10">
        
        {/* Innovative Hero Header */}
        <div className="text-center max-w-2xl mx-auto shrink-0 mb-3 md:mb-1">
         

          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#111111] dark:text-[#F2F3F5] tracking-tight leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#1E6FF0] via-[#2563EB] to-[#8B5CF6] bg-clip-text text-transparent gap-1.5">
              HireStream
            </span>
          </h1>
        
        </div>

        {/* Innovative Dual-Role Portals */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 shrink-0 my-2 md:my-1">
          
          {/* Recruiter Card */}
          <div 
            onClick={handleGetStarted}
            className="group relative bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] hover:border-[#1E6FF0]/60 dark:hover:border-[#1E6FF0]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_12px_36px_rgba(30,111,240,0.12)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col min-h-[380px] md:min-h-[400px] lg:min-h-[420px] cursor-pointer"
          >
            {/* Top Interactive Banner with Animated SVG */}
            <div className="w-full h-36 sm:h-40 md:h-36 lg:h-40 bg-gradient-to-br from-[#EDF3FE] via-[#F4F8FF] to-[#E5EFFF] dark:from-[#141822] dark:via-[#161C28] dark:to-[#121620] relative overflow-hidden shrink-0 border-b border-[#E7E9EE]/60 dark:border-[#262B35]/60">
              {!recruiterImgError ? (
                <img
                  src="/recruiter-animated.svg"
                  alt="Recruiter pipeline coordination"
                  loading="eager"
                  onError={() => setRecruiterImgError(true)}
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1E6FF0]">
                  <Briefcase className="w-10 h-10 stroke-1" />
                </div>
              )}

              {/* Live Role Badge overlay */}
              <div className="absolute top-2.5 left-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#1A1D24]/90 backdrop-blur-sm border border-[#E7E9EE] dark:border-[#262B35] text-[10px] font-bold text-[#1E6FF0] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6FF0]" />
                PIPELINE LEAD
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1E6FF0]/10 text-[#1E6FF0] flex items-center justify-center shrink-0">
                      <Briefcase className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] group-hover:text-[#1E6FF0] transition-colors">
                        Recruiter Workspace
                      </h2>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                </div>

                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-3.5 leading-relaxed">
                  Oversee open positions, assign interviewer panels, and accelerate candidate progression.
                </p>

                {/* Capability Pills */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#E7E9EE] dark:border-[#262B35]">
                  <div className="flex items-center gap-2 text-xs text-[#4A4A4A] dark:text-[#CBD5E1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Manage job postings &amp; candidate pipelines</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4A4A4A] dark:text-[#CBD5E1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Real-time stage transitions &amp; SLA tracking</span>
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="pt-3 mt-3 border-t border-[#E7E9EE]/80 dark:border-[#262B35]/80 flex items-center justify-between text-xs font-semibold text-[#1E6FF0]">
                <span>Access Recruiter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Interviewer Card */}
          <div 
            onClick={handleGetStarted}
            className="group relative bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] hover:border-[#8B5CF6]/60 dark:hover:border-[#8B5CF6]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_12px_36px_rgba(139,92,246,0.12)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col min-h-[380px] md:min-h-[400px] lg:min-h-[420px] cursor-pointer"
          >
            {/* Top Interactive Banner with Animated SVG */}
            <div className="w-full h-36 sm:h-40 md:h-36 lg:h-40 bg-gradient-to-br from-[#F5F3FF] via-[#F8F6FF] to-[#EDE9FE] dark:from-[#181424] dark:via-[#1A1628] dark:to-[#151220] relative overflow-hidden shrink-0 border-b border-[#E7E9EE]/60 dark:border-[#262B35]/60">
              {!interviewerImgError ? (
                <img
                  src="/interviewer-animated.svg"
                  alt="Interviewer scorecards and feedback"
                  loading="eager"
                  onError={() => setInterviewerImgError(true)}
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8B5CF6]">
                  <Users className="w-10 h-10 stroke-1" />
                </div>
              )}

              {/* Live Role Badge overlay */}
              <div className="absolute top-2.5 left-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#1A1D24]/90 backdrop-blur-sm border border-[#E7E9EE] dark:border-[#262B35] text-[10px] font-bold text-[#8B5CF6] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                PANEL REVIEWER
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] group-hover:text-[#8B5CF6] transition-colors">
                        Interviewer Portal
                      </h2>
                    </div>
                  </div>
                  <Award className="w-4 h-4 text-[#8B5CF6]" />
                </div>

                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-3.5 leading-relaxed">
                  Evaluate candidates, submit competency ratings, and reach unanimous hiring consensus.
                </p>

                {/* Capability Pills */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#E7E9EE] dark:border-[#262B35]">
                  <div className="flex items-center gap-2 text-xs text-[#4A4A4A] dark:text-[#CBD5E1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>View assigned interview queue &amp; resumes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4A4A4A] dark:text-[#CBD5E1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Submit structured scorecards &amp; notes</span>
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="pt-3 mt-3 border-t border-[#E7E9EE]/80 dark:border-[#262B35]/80 flex items-center justify-between text-xs font-semibold text-[#8B5CF6]">
                <span>Access Interviewer Reviews</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>

        {/* Primary Unified CTA */}
        <div className="flex flex-col items-center gap-2 shrink-0 my-1 md:my-0 gap-2">
          <button
            type="button"
            onClick={handleGetStarted}
            className="group rounded-2xl bg-[#1E6FF0] text-white hover:bg-[#1656C2] active:bg-[#1249A8] font-semibold text-sm sm:text-base py-3 px-8 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E6FF0] shadow-md hover:shadow-lg hover:shadow-[#1E6FF0]/25 flex items-center gap-2"
          >
            <span>Get Started with HireStream</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Value Highlights Pill Strip */}
          <div className="flex items-center gap-3 sm:gap-5 text-[11px] text-[#6B7280] dark:text-[#7E8494] mt-0.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              Role-Based Access
            </span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              Instant Portal Routing
            </span>
          </div>
        </div>

      </main>

      {/* Compact Minimal Footer */}
      {/* <footer className="w-full max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#7E8494] border-t border-[#E7E9EE] dark:border-[#262B35] shrink-0 relative z-10">
        <span>&copy; {new Date().getFullYear()} HireStream Operations. All rights reserved.</span>
        <span className="hidden sm:inline">Secure Enterprise ATS &amp; Interview Management</span>
      </footer> */}
    </div>
  );
};
