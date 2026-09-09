import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
  UserX,
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications.js';
import { useJobs } from '../../hooks/useJobs.js';
import { exportApplicationsCsvApi } from '../../api/applications.js';
import { StageBadge } from '../../components/applications/StageBadge.jsx';
import { ApplicationFormModal } from '../../components/applications/ApplicationFormModal.jsx';
import { BulkActionModal } from '../../components/applications/BulkActionModal.jsx';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const SOURCES = ['LinkedIn', 'Referral', 'Careers Page', 'Direct', 'GitHub', 'Agency', 'Other'];

export const ApplicationsPage = () => {
  // Query parameters state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selected applications for bulk operations
  const [selectedAppIds, setSelectedAppIds] = useState(new Set());

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bulkModal, setBulkModal] = useState({
    isOpen: false,
    action: 'advance', // 'advance' | 'reject'
  });
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Fetch Jobs for the filter dropdown
  const { data: jobsList } = useJobs({ includeArchived: 'true' });

  // Fetch Applications with server-side query parameters
  const queryParams = {
    search: activeSearch || undefined,
    jobOpeningId: selectedJobId || undefined,
    stage: selectedStage || undefined,
    source: selectedSource || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  };

  const {
    data: applicationsResult,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApplications(queryParams);

  const applications = applicationsResult?.data || [];
  const totalCount = applicationsResult?.total_count || 0;
  const totalPages = applicationsResult?.total_pages || 1;

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setSelectedJobId('');
    setSelectedStage('');
    setSelectedSource('');
    setSortBy('appliedDate');
    setSortOrder('desc');
    setPage(1);
    setSelectedAppIds(new Set());
  };

  // Bulk Selection Handlers
  const handleSelectAllOnPage = (e) => {
    if (e.target.checked) {
      const allIds = new Set(selectedAppIds);
      applications.forEach((app) => allIds.add(app.id));
      setSelectedAppIds(allIds);
    } else {
      const remainingIds = new Set(selectedAppIds);
      applications.forEach((app) => remainingIds.delete(app.id));
      setSelectedAppIds(remainingIds);
    }
  };

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedAppIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedAppIds(next);
  };

  const isAllOnPageSelected =
    applications.length > 0 &&
    applications.every((app) => selectedAppIds.has(app.id));

  const selectedApplicationsList = applications.filter((app) =>
    selectedAppIds.has(app.id)
  );

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      await exportApplicationsCsvApi({
        search: activeSearch || undefined,
        jobOpeningId: selectedJobId || undefined,
        stage: selectedStage || undefined,
        source: selectedSource || undefined,
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to generate CSV export.'
      );
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#111111] dark:text-[#F2F3F5] tracking-tight">
              Candidate Applications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#AEB2BB] mt-1">
            Search, filter, evaluate, and progress candidate profiles across organizational hiring pipelines.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh candidate data"
            className="p-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#4A4A4A] dark:text-[#AEB2BB] hover:text-[#111111] dark:hover:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] disabled:opacity-50 cursor-pointer"
            aria-label="Refresh applications"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-3.5 py-2.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExportingCsv ? 'animate-bounce' : ''}`} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] focus:ring-offset-2 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        {/* Search input + Submit */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by candidate name or email address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-[#F5F7FB] dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:bg-white dark:focus:bg-[#1A1D24] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6FF0] cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters & Sorting Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Job Opening Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494] mb-1">
              Job Opening
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              <option value="">All Job Openings</option>
              {Array.isArray(jobsList) &&
                jobsList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494] mb-1">
              Pipeline Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494] mb-1">
              Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              <option value="">All Sources</option>
              {SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494] mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
            >
              <option value="appliedDate">Applied Date</option>
              <option value="stage">Stage</option>
              <option value="updatedAt">Last Updated</option>
              <option value="candidateName">Candidate Name</option>
            </select>
          </div>

          {/* Sort Order & Reset */}
          <div className="flex items-end gap-2 col-span-2 md:col-span-1">
            <button
              type="button"
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
              title="Toggle sort direction"
              className="flex-1 py-2 px-3 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#4A4A4A] dark:text-[#AEB2BB] hover:text-[#111111] dark:hover:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters and search"
              className="p-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#15181E] text-[#6B7280] dark:text-[#7E8494] hover:text-[#C0392B] transition-colors cursor-pointer"
              aria-label="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedAppIds.size > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] border border-[#BFDBFE] dark:border-[#1E3A8A] flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E6FF0] animate-pulse" />
            <span className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
              {selectedAppIds.size}{' '}
              {selectedAppIds.size === 1 ? 'candidate selected' : 'candidates selected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkModal({ isOpen: true, action: 'advance' })}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Bulk Advance</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkModal({ isOpen: true, action: 'reject' })}
              className="px-3.5 py-1.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Bulk Reject</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAppIds(new Set())}
              className="px-3 py-1.5 rounded-xl border border-[#BFDBFE] dark:border-[#1E3A8A] bg-white dark:bg-[#1A1D24] text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB] hover:bg-[#F5F7FB] transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton Table */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-14 bg-gray-100 dark:bg-[#15181E] rounded-xl"
              />
            ))}
          </div>
        </div>
      ) : isError ? (
        /* Error Alert */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-10 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F1] dark:bg-[rgba(192,57,43,0.15)] text-[#C0392B] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[#111111] dark:text-[#F2F3F5] mb-1">
            Unable to Load Applications
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
            {error?.message || 'An error occurred while fetching candidate applications.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] flex items-center justify-center mx-auto mb-4">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-semibold text-base sm:text-lg text-[#111111] dark:text-[#F2F3F5] mb-1.5">
            No Applications Found
          </h3>
          <p className="text-xs text-[#4A4A4A] dark:text-[#AEB2BB] mb-6 leading-relaxed">
            {activeSearch || selectedJobId || selectedStage || selectedSource
              ? 'No candidates match your current filter parameters. Try clearing your filters or searching with a different term.'
              : 'There are currently no candidates in the pipeline. Add your first candidate application to get started.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {(activeSearch || selectedJobId || selectedStage || selectedSource) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs font-semibold text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-[#1E6FF0] hover:bg-[#1656C2] text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        </div>
      ) : (
        /* Applications Table */
        <div className="rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Metadata Subheader */}
          <div className="px-6 py-4 border-b border-[#E7E9EE] dark:border-[#262B35] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280] dark:text-[#7E8494]">
            <div>
              Showing{' '}
              <strong className="text-[#111111] dark:text-[#F2F3F5]">
                {(page - 1) * limit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-[#111111] dark:text-[#F2F3F5]">
                {Math.min(page * limit, totalCount)}
              </strong>{' '}
              of <strong className="text-[#111111] dark:text-[#F2F3F5]">{totalCount}</strong>{' '}
              candidates
            </div>

            {selectedAppIds.size > 0 && (
              <div className="text-[#1E6FF0] font-semibold">
                {selectedAppIds.size} selected
              </div>
            )}
          </div>

          {/* Desktop/Tablet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/50 dark:bg-[#15181E] text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#7E8494]">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllOnPageSelected}
                      onChange={handleSelectAllOnPage}
                      className="rounded border-[#E7E9EE] text-[#1E6FF0] focus:ring-[#1E6FF0] cursor-pointer"
                      aria-label="Select all candidates on this page"
                    />
                  </th>
                  <th className="py-4 px-3">Candidate</th>
                  <th className="py-4 px-3">Job Opening</th>
                  <th className="py-4 px-3">Stage</th>
                  <th className="py-4 px-3">Source</th>
                  <th className="py-4 px-3">Panel</th>
                  <th className="py-4 px-3">Applied</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E9EE] dark:divide-[#262B35] text-xs">
                {applications.map((app) => {
                  const isSelected = selectedAppIds.has(app.id);
                  const job = app.jobOpening || {};
                  const panelMembers = app.interviewPanels || [];
                  const appliedDate = app.appliedDate
                    ? new Date(app.appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-[#F5F7FB]/60 dark:hover:bg-[#212836]/40 transition-colors ${
                        isSelected ? 'bg-[#EDF3FE]/40 dark:bg-[rgba(30,111,240,0.08)]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(app.id)}
                          className="rounded border-[#E7E9EE] text-[#1E6FF0] focus:ring-[#1E6FF0] cursor-pointer"
                          aria-label={`Select candidate ${app.candidateName}`}
                        />
                      </td>

                      {/* Candidate Name & Email */}
                      <td className="py-4 px-3">
                        <Link
                          to={`/applications/${app.id}`}
                          className="font-semibold text-[#111111] dark:text-[#F2F3F5] hover:text-[#1E6FF0] transition-colors block truncate max-w-[180px] focus:underline"
                        >
                          {app.candidateName}
                        </Link>
                        <span className="text-[11px] text-[#6B7280] dark:text-[#7E8494] block truncate max-w-[180px]">
                          {app.email}
                        </span>
                      </td>

                      {/* Job Opening */}
                      <td className="py-4 px-3">
                        <span className="font-medium text-[#111111] dark:text-[#F2F3F5] block truncate max-w-[160px]">
                          {job.title || '—'}
                        </span>
                        <span className="text-[11px] text-[#6B7280] dark:text-[#7E8494] block truncate max-w-[160px]">
                          {job.department || ''}
                        </span>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <StageBadge
                          stage={app.stage}
                          rejectedFromStage={app.rejectedFromStage}
                        />
                      </td>

                      {/* Source */}
                      <td className="py-4 px-3 whitespace-nowrap text-[#4A4A4A] dark:text-[#AEB2BB]">
                        {app.source}
                      </td>

                      {/* Panel */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {panelMembers.length > 0 ? (
                          <div
                            className="flex items-center gap-1 text-[11px] font-medium text-[#1E6FF0]"
                            title={panelMembers
                              .map((p) => p.user?.name || 'Interviewer')
                              .join(', ')}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {panelMembers.length}{' '}
                              {panelMembers.length === 1 ? 'interviewer' : 'interviewers'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#9CA3AF] text-[11px]">—</span>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-3 whitespace-nowrap text-[#6B7280] dark:text-[#7E8494]">
                        {appliedDate}
                      </td>

                      {/* Action Link */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6FF0] hover:text-[#1656C2] focus:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#E7E9EE] dark:border-[#262B35] flex items-center justify-between text-xs">
              <span className="text-[#6B7280] dark:text-[#7E8494]">
                Page <strong className="text-[#111111] dark:text-[#F2F3F5]">{page}</strong> of{' '}
                <strong className="text-[#111111] dark:text-[#F2F3F5]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] bg-white dark:bg-[#1A1D24] text-[#111111] dark:text-[#F2F3F5] hover:bg-[#F5F7FB] dark:hover:bg-[#262B35] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Candidate Modal */}
      <ApplicationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Handled via TanStack Query cache invalidation
        }}
      />

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={bulkModal.isOpen}
        onClose={() => setBulkModal({ isOpen: false, action: 'advance' })}
        action={bulkModal.action}
        selectedApplications={selectedApplicationsList}
        onSuccess={() => {
          setSelectedAppIds(new Set());
        }}
      />
    </div>
  );
};
