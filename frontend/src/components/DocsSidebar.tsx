import { Link, useLocation } from 'react-router-dom';

export function DocsSidebar() {
  const location = useLocation();

  const docsSections = [
    {
      title: 'Getting Started',
      path: '/docs/getting-started',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Multisig Wallets',
      path: '/docs/multisig-wallets',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Modules',
      path: '/docs/modules',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      subsections: [
        {
          title: 'Social Recovery',
          path: '/docs/modules/social-recovery',
        },
      ],
    },
    {
      title: 'Frontend Guide',
      path: '/docs/frontend-guide',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Developer Guide',
      path: '/docs/developer-guide',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Security',
      path: '/docs/security',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'FAQ',
      path: '/docs/faq',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === '/docs') {
      return location.pathname === '/docs';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="fixed left-0 top-[7rem] h-[calc(100vh-7rem)] w-64 bg-white dark:bg-vault-dark-2 border-r-2 border-dark-200 dark:border-dark-700 flex flex-col z-20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-dark-200 dark:border-dark-700">
        <Link
          to="/docs"
          className="flex items-center gap-2 text-base font-display font-bold text-gradient-red vault-text-glow"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Documentation
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          <Link
            to="/docs"
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-all ${
              location.pathname === '/docs'
                ? 'text-primary-600 dark:text-primary-400 vault-text-glow bg-dark-100 dark:bg-vault-dark-4'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-vault-dark-4'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </Link>

          {docsSections.map((section) => {
            const active = isActive(section.path);
            const hasSubsections = section.subsections && section.subsections.length > 0;

            return (
              <div key={section.path}>
                <Link
                  to={section.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-all ${
                    active && !hasSubsections
                      ? 'text-primary-600 dark:text-primary-400 vault-text-glow bg-dark-100 dark:bg-vault-dark-4'
                      : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-vault-dark-4'
                  }`}
                >
                  <span className="text-primary-500">{section.icon}</span>
                  {section.title}
                </Link>
                {hasSubsections && active && (
                  <div className="ml-7 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <Link
                        key={subsection.path}
                        to={subsection.path}
                        className={`block px-3 py-1.5 rounded text-xs font-medium transition-all ${
                          location.pathname === subsection.path
                            ? 'text-primary-600 dark:text-primary-400 bg-dark-100 dark:bg-vault-dark-4'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-vault-dark-4'
                        }`}
                      >
                        {subsection.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Links */}
      <div className="px-4 py-4 border-t border-dark-200 dark:border-dark-700">
        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          <a
            href="https://github.com/mpoletiek/quai-multisig"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View Source
          </a>
        </div>
      </div>
    </aside>
  );
}
