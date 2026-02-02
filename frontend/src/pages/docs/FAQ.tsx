import { Link } from 'react-router-dom';

export function FAQ() {
  const faqs = [
    {
      question: "What is a multisig wallet?",
      answer: "A multisig (multi-signature) wallet requires multiple approvals before executing transactions. Instead of one key controlling everything, control is distributed among multiple owners with a configurable threshold (e.g., 2 of 3 owners must approve)."
    },
    {
      question: "How do I create a multisig vault?",
      answer: "Connect your wallet, click 'Create' in the sidebar, add owner addresses, set a threshold, and deploy. You'll need to approve two transactions: one for the implementation and one for your vault proxy."
    },
    {
      question: "What's the difference between proposing, approving, and executing?",
      answer: "Proposing creates a transaction that needs approvals. Approving adds your signature to a proposal. Executing actually performs the on-chain action once enough approvals are collected."
    },
    {
      question: "Can I change the owners or threshold after deployment?",
      answer: "Yes! You can add/remove owners and change the threshold through multisig transactions. These are self-calls to the vault contract and require threshold approvals."
    },
    {
      question: "What happens if I lose access to my owner key?",
      answer: "If you have Social Recovery configured, guardians can help recover access. Otherwise, the remaining owners can remove you and add a new owner. If you're the only owner or lose all keys, the vault may become inaccessible."
    },
    {
      question: "How does Social Recovery work?",
      answer: "Guardians can initiate recovery to replace owners. After threshold guardian approvals and a time delay, the recovery can be executed. Current owners can cancel recoveries during the delay period."
    },
    {
      question: "What are modules and why should I use them?",
      answer: "Modules extend vault functionality. Social Recovery enables wallet recovery, Daily Limits allow quick small transactions, and Whitelist pre-approves trusted addresses. All modules are optional."
    },
    {
      question: "Can transactions be cancelled?",
      answer: "Yes. The proposer can cancel immediately, or any owner can cancel if the transaction has reached threshold approvals. Once executed, transactions cannot be cancelled."
    },
    {
      question: "How much gas do transactions cost?",
      answer: "Gas costs vary: proposing (~50-100k), approving (~45-80k), executing (variable based on target contract), cancelling (~30-50k). The frontend estimates gas and adds buffers automatically."
    },
    {
      question: "Is Quai Vault audited?",
      answer: "The contracts are currently on testnet and pre-audit. A formal security audit is planned before mainnet deployment. All code is open source for review."
    },
    {
      question: "Can I use this on mainnet?",
      answer: "Currently, Quai Vault is deployed on Orchard Testnet only. Do not store significant funds. Mainnet deployment will follow testing and audits."
    },
    {
      question: "What happens if a recovery doesn't execute automatically?",
      answer: "Recoveries require manual execution - they don't happen automatically. Once conditions are met (threshold approvals + time delay), anyone can call executeRecovery(). The frontend shows an 'Execute Recovery' button when ready."
    },
    {
      question: "Can I have multiple modules enabled at once?",
      answer: "Yes! All modules work independently and can be enabled simultaneously. For example, you can have Social Recovery, Daily Limits, and Whitelist all active at the same time."
    },
    {
      question: "How do I verify a transaction on-chain?",
      answer: "Use the transaction lookup feature or check the transaction hash on a block explorer. All transactions emit events that can be queried on-chain."
    },
    {
      question: "What if I approve a transaction by mistake?",
      answer: "You can revoke your approval at any time before the transaction is executed. For regular multisig transactions, use the 'Revoke' button next to your approval. For social recovery approvals, guardians can also revoke their approval from the recovery management panel."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/docs"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documentation
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Common questions and answers about Quai Vault multisig wallets.
        </p>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="vault-panel p-6">
            <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm mt-0.5">
                Q
              </span>
              <span>{faq.question}</span>
            </h2>
            <div className="ml-9">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm mt-0.5">
                  A
                </span>
                <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="vault-panel p-6 mt-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Still Have Questions?</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            Can't find what you're looking for? Here are additional resources:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Link
              to="/docs/getting-started"
              className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
            >
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                Getting Started Guide
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Step-by-step instructions for creating your first vault
              </p>
            </Link>
            <a
              href="https://github.com/mpoletiek/quai-multisig/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
            >
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                GitHub Issues
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Report bugs or ask questions on GitHub
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
