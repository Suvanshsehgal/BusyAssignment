import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/useTheme.js';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        p-2 rounded-full border border-[#E7E9EE] dark:border-[#262B35]
        bg-white dark:bg-[#1A1D24]
        text-[#4A4A4A] dark:text-[#AEB2BB]
        hover:bg-[#F5F7FB] dark:hover:bg-[#212836]
        hover:text-[#111111] dark:hover:text-[#F2F3F5]
        transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6FF0]
        ${className}
      `}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#BA7517]" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-[#1E6FF0]" aria-hidden="true" />
      )}
    </button>
  );
};
