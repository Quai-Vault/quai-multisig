import { useThemeStore } from '../store/themeStore';

/**
 * Theme toggle button that switches between light and dark themes.
 * System preference is used as the default on first load.
 */
export function ThemeToggle() {
  const { resolvedTheme, cycleTheme } = useThemeStore();

  const icon = resolvedTheme === 'light' ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const label = resolvedTheme === 'light' ? 'Light' : 'Dark';

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium
                 text-dark-500 dark:text-dark-400
                 hover:text-dark-700 dark:hover:text-dark-200
                 hover:bg-dark-100 dark:hover:bg-vault-dark-4
                 rounded-md transition-all"
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-primary-500">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
