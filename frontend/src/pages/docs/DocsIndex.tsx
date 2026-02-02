import { Link } from 'react-router-dom';

export function DocsIndex() {
  const docSections = [
    {
      title: 'Getting Started',
      description: 'Learn how to create your first multisig vault and start using Quai Vault',
      path: '/docs/getting-started',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Multisig Wallets',
      description: 'Understanding how multisig wallets work, proposals, approvals, and execution',
      path: '/docs/multisig-wallets',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Modules',
      description: 'Extend your vault with Social Recovery, Daily Limits, and Whitelist modules',
      path: '/docs/modules',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Frontend Guide',
      description: 'Complete guide to using the Quai Vault web interface',
      path: '/docs/frontend-guide',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Developer Guide',
      description: 'Technical documentation for developers integrating with Quai Vault',
      path: '/docs/developer-guide',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Security',
      description: 'Security considerations, best practices, and audit information',
      path: '/docs/security',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions and troubleshooting',
      path: '/docs/faq',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Documentation
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Comprehensive documentation for Quai Vault multisig wallets, modules, and the frontend interface.
          Whether you're a user, developer, or security researcher, find everything you need here.
        </p>
      </div>

      {/* Quick Links */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Quick Start</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/docs/getting-started"
            className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Getting Started
          </Link>
          <Link
            to="/create"
            className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Vault
          </Link>
          <a
            href="https://github.com/mpoletiek/quai-multisig"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View Source Code
          </a>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docSections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="vault-panel p-6 hover:border-primary-600/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-primary-500 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed mb-3">
                  {section.description}
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-semibold">
                  Read more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="vault-panel p-6 mt-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Additional Resources</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Network Information</p>
              <p className="text-dark-500 dark:text-dark-400">
                Quai Vault is currently deployed on the <strong>Orchard Testnet</strong>. 
                This is an engineering testing environment - do not store significant funds.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Smart Contracts</p>
              <p className="text-dark-500 dark:text-dark-400">
                All contracts are open source and verified. Review the code, security considerations, 
                and audit reports in the <Link to="/docs/security" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">Security</Link> section.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Support</p>
              <p className="text-dark-500 dark:text-dark-400">
                Found a bug or have a question? Check the <Link to="/docs/faq" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">FAQ</Link> or 
                open an issue on <a href="https://github.com/mpoletiek/quai-multisig" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">GitHub</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
