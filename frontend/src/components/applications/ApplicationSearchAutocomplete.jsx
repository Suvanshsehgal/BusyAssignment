import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X, Briefcase, ChevronRight, User } from 'lucide-react';
import { useApplicationAutocomplete } from '../../hooks/useApplications.js';
import { StageBadge } from './StageBadge.jsx';

/**
 * Escapes regex special characters in a search string.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Component to highlight matched search query portions in text.
 */
const HighlightMatch = ({ text, query }) => {
  if (!text || !query || !query.trim()) {
    return <span>{text || ''}</span>;
  }

  const trimmed = query.trim();
  const regex = new RegExp(`(${escapeRegex(trimmed)})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-[#1E6FF0]/15 dark:bg-[#1E6FF0]/30 text-[#1E6FF0] dark:text-[#60A5FA] font-bold rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const ApplicationSearchAutocomplete = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search by candidate name or email address...',
}) => {
  const navigate = useNavigate();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce user input by 280ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = value.trim();
      setDebouncedQuery(trimmed);
      if (trimmed) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [value]);

  // Server-side TanStack Query autocomplete
  const {
    data: searchResult,
    isLoading,
    isFetching,
    isError,
  } = useApplicationAutocomplete(debouncedQuery);

  const suggestions = searchResult?.data || [];
  const hasResults = suggestions.length > 0;
  const isQueryActive = debouncedQuery.length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen || !isQueryActive) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (suggestions.length === 0) return -1;
          return prev < suggestions.length - 1 ? prev + 1 : 0;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (suggestions.length === 0) return -1;
          return prev > 0 ? prev - 1 : suggestions.length - 1;
        });
        break;

      case 'Enter':
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
        } else {
          // If no suggestion is highlighted, allow natural form submission
          setIsOpen(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Navigate to application detail page on selection
  const handleSelect = (application) => {
    if (!application?.id) return;
    setIsOpen(false);
    setHighlightedIndex(-1);
    navigate(`/applications/${application.id}`);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    setDebouncedQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Search Input Container */}
      <div className="relative">
        <Search
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="applications-autocomplete-list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `autocomplete-option-${highlightedIndex}` : undefined
          }
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && e.target.value.trim()) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (value.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-16 py-2 rounded-xl border border-[#E7E9EE] dark:border-[#262B35] text-xs bg-[#F5F7FB] dark:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5] placeholder-[#9CA3AF] transition-colors focus:bg-white dark:focus:bg-[#1A1D24] focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]"
        />

        {/* Right side controls: Clear button & Loading indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isFetching && (
            <Loader2
              className="w-3.5 h-3.5 text-[#1E6FF0] animate-spin"
              aria-label="Searching..."
            />
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-1 rounded-md text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F2F3F5] hover:bg-[#E7E9EE] dark:hover:bg-[#262B35] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && isQueryActive && (
        <div
          id="applications-autocomplete-list"
          role="listbox"
          aria-label="Applications autocomplete suggestions"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#1A1D24] border border-[#E7E9EE] dark:border-[#262B35] shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-150 max-h-[380px] flex flex-col"
        >
          {/* Header Strip */}
          <div className="px-4 py-2 border-b border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/70 dark:bg-[#15181E]/70 flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#7E8494] shrink-0 select-none">
            <span className="font-semibold uppercase tracking-wider">
              {isFetching ? 'Searching candidates...' : 'Suggestions'}
            </span>
            <span className="text-[10px]">
              Press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#262B35] border border-[#E7E9EE] dark:border-[#374151] font-mono">↵</kbd> to search all
            </span>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto divide-y divide-[#E7E9EE]/60 dark:divide-[#262B35]/60">
            {isLoading && !hasResults ? (
              /* Loading Skeleton */
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-2.5 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              /* Error State */
              <div className="p-4 text-center text-xs text-[#C0392B] dark:text-[#F87171]">
                Unable to load suggestions. Press <strong>Search</strong> to query all applications.
              </div>
            ) : !hasResults ? (
              /* Empty State */
              <div className="py-6 px-4 text-center">
                <p className="text-xs font-semibold text-[#111111] dark:text-[#F2F3F5]">
                  No applications found
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#7E8494] mt-1">
                  No matches for &ldquo;<span className="font-medium text-[#111111] dark:text-[#F2F3F5]">{debouncedQuery}</span>&rdquo;
                </p>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] dark:text-[#60A5FA] text-xs font-semibold hover:bg-[#1E6FF0] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Search across full database</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Results List */
              suggestions.map((app, index) => {
                const isHighlighted = highlightedIndex === index;
                const jobTitle = app.jobOpening?.title;

                return (
                  <div
                    key={app.id}
                    id={`autocomplete-option-${index}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(app)}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isHighlighted
                        ? 'bg-[#EDF3FE] dark:bg-[#212836] text-[#1E6FF0] dark:text-[#60A5FA]'
                        : 'hover:bg-[#F5F7FB] dark:hover:bg-[#15181E] text-[#111111] dark:text-[#F2F3F5]'
                    }`}
                  >
                    {/* Left: Avatar & Candidate Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[#1E6FF0]/10 dark:bg-[#1E6FF0]/20 text-[#1E6FF0] flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#111111] dark:text-[#F2F3F5] truncate">
                            <HighlightMatch text={app.candidateName} query={debouncedQuery} />
                          </span>
                        </div>

                        <div className="text-[11px] text-[#6B7280] dark:text-[#7E8494] truncate">
                          <HighlightMatch text={app.email} query={debouncedQuery} />
                        </div>

                        {jobTitle && (
                          <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#7E8494] mt-0.5 truncate">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{jobTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Stage Badge & Navigation Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      {app.stage && <StageBadge stage={app.stage} />}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isHighlighted ? 'translate-x-0.5 text-[#1E6FF0] dark:text-[#60A5FA]' : 'text-[#9CA3AF]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Strip */}
          {hasResults && (
            <div className="px-4 py-2 border-t border-[#E7E9EE] dark:border-[#262B35] bg-[#F5F7FB]/50 dark:bg-[#15181E]/50 flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#7E8494] shrink-0 select-none">
              <span>Use <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
              <button
                type="button"
                onClick={onSubmit}
                className="font-semibold text-[#1E6FF0] hover:underline cursor-pointer"
              >
                View all results &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
