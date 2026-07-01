import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';

const generateIdempotencyKey = () => {
  return 'sys-fund-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

function Admin() {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const handleGrantFunds = async (e) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    const numericAmount = parseFloat(amount);
    if (!toAccount) {
      setErrorText('Recipient account is required.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorText('Please enter a valid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      const idempotencyKey = generateIdempotencyKey();

      const response = await API.post('/api/transactions/system/initial-funds', {
        toAccount,
        amount: numericAmount,
        idempotencyKey
      });

      setSuccessText(response.data.message || 'Initial funds granted successfully!');
      setToAccount('');
      setAmount('');
    } catch (err) {
      console.error('System initial funds error:', err);
      setErrorText(err.response?.data?.message || 'Failed to grant initial funds. Verify account ID and system access.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="System Admin Workspace">
      {/* Warning banner */}
      <div className="w-full bg-error-container text-on-error-container px-4 sm:px-6 lg:px-10 py-sm flex items-center justify-center gap-md border-b border-error/20">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
        <span className="font-label-md text-label-md tracking-wider uppercase font-bold text-center">
          Authorized System Personnel Only. Actions on this page affect core ledger balances.
        </span>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
      </div>

      <div className="p-4 sm:p-6 lg:p-10 space-y-2xl max-w-[1400px] mx-auto w-full flex-grow">
        {/* Header */}
        <div className="flex flex-col gap-xs">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Ledger Operations</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Execute direct adjustments, allocate reserve liquidity, and configure system parameter overrides.
          </p>
        </div>

        {/* Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Main Action Form */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-xl space-y-xl border border-outline-variant/10 shadow-2xl">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-2xl bg-error-container/20 border border-error/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">admin_panel_settings</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Issue Initial System Funds</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                  Allocate initial balance parameters to active asset vaults.
                </p>
              </div>
            </div>

            {errorText && (
              <div className="p-md bg-error-container/20 border border-error/30 rounded-xl text-error font-label-sm text-xs animate-fadeIn">
                {errorText}
              </div>
            )}

            {successText && (
              <div className="p-md bg-secondary-container/20 border border-secondary/30 rounded-xl text-secondary font-label-sm text-xs animate-fadeIn">
                {successText}
              </div>
            )}

            <form onSubmit={handleGrantFunds} className="space-y-lg pt-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-sm">Recipient Account ID</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">account_balance_wallet</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all font-mono text-sm" 
                    placeholder="Enter 24-character Account ID" 
                    required 
                    type="text"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value.trim())}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-sm">Initial Amount (PKR)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">payments</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all font-mono text-sm" 
                    placeholder="0.00" 
                    required 
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-error hover:opacity-90 active:scale-95 text-on-error font-label-md py-4 rounded-xl flex items-center justify-center gap-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-md">lock_open</span>
                {isSubmitting ? 'Executing System Grant...' : 'Authorize System Ledger Grant'}
              </button>
            </form>
          </div>

          {/* Right Info Panels */}
          <div className="lg:col-span-4 flex flex-col gap-lg">
            <div className="glass-panel rounded-3xl p-lg space-y-md border border-outline-variant/10">
              <h4 className="font-headline-md text-headline-md text-on-surface">Audit Logging</h4>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Every transaction issued from this admin workspace is permanently logged with your active system administrator credentials.
              </p>
              <div className="p-sm bg-surface-container-highest/50 rounded-xl border border-outline-variant/10">
                <span className="font-mono text-xs text-error font-bold uppercase tracking-wider block mb-1">Security Alert</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Transactions cannot be rolled back or deleted. Immutability policies are strictly active.
                </span>
              </div>
            </div>

            <div className="bg-[#171f33] border border-outline-variant/20 rounded-3xl p-lg flex items-center gap-lg">
              <div className="w-14 h-14 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-[32px]">gavel</span>
              </div>
              <div>
                <h4 className="font-headline-md text-[18px] text-white">Compliance</h4>
                <p className="font-label-sm text-white/80">Ledger rules comply with FCA security guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-xl px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="flex flex-col gap-xs text-center sm:text-left mb-lg sm:mb-0">
          <span className="font-label-md text-label-md font-bold text-primary">ApexWallet Systems</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">© {new Date().getFullYear()} ApexWallet Solutions. All rights reserved.</span>
        </div>
        <div className="flex gap-xl text-on-surface-variant font-label-sm text-label-sm">
          <a href="#rules" className="hover:text-primary transition-colors">Admin Policy</a>
          <a href="#compliance" className="hover:text-primary transition-colors">Compliance Rules</a>
        </div>
      </footer>
    </DashboardLayout>
  );
}

export default Admin;
