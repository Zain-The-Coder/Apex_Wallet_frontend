import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Object keeping track of balance statuses for each account
  // format: { [accountId]: { revealed: boolean, balance: number, loading: boolean } }
  const [balanceStates, setBalanceStates] = useState({});

  // Account creation state
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Settings states
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [allowInternational, setAllowInternational] = useState(true);

  // Fetch user accounts on load
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/api/accounts');
      const accountsList = response.data.accounts || [];
      setAccounts(accountsList);

      // Initialize balance states
      const initialBalances = {};
      accountsList.forEach(acc => {
        initialBalances[acc._id] = { revealed: false, balance: null, loading: false };
      });
      setBalanceStates(initialBalances);

      // Select first account by default for policy view
      if (accountsList.length > 0) {
        setSelectedAccount(accountsList[0]);
        setIsFrozen(accountsList[0].status === 'FROZEN');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch your account information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    try {
      setCreatingAccount(true);
      await API.post('/api/accounts');
      // Refresh list
      await fetchAccounts();
    } catch (err) {
      console.error('Error creating account:', err);
      alert(err.response?.data?.message || 'Failed to create a new wallet account.');
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleToggleBalance = async (accountId) => {
    const currentState = balanceStates[accountId];
    if (!currentState) return;

    if (currentState.revealed) {
      // Hide balance
      setBalanceStates(prev => ({
        ...prev,
        [accountId]: { ...prev[accountId], revealed: false }
      }));
    } else {
      // If balance already fetched, just reveal it
      if (currentState.balance !== null) {
        setBalanceStates(prev => ({
          ...prev,
          [accountId]: { ...prev[accountId], revealed: true }
        }));
        return;
      }

      // Fetch balance from API
      setBalanceStates(prev => ({
        ...prev,
        [accountId]: { ...prev[accountId], loading: true }
      }));

      try {
        const response = await API.get(`/api/accounts/balance/${accountId}`);
        const balance = response.data.balance;
        
        setBalanceStates(prev => ({
          ...prev,
          [accountId]: { revealed: true, balance, loading: false }
        }));
      } catch (err) {
        console.error('Error fetching balance:', err);
        setBalanceStates(prev => ({
          ...prev,
          [accountId]: { revealed: false, balance: null, loading: false }
        }));
        alert('Failed to retrieve account balance.');
      }
    }
  };

  const handleCopy = (text, e) => {
    navigator.clipboard.writeText(text);
    const originalContent = e.currentTarget.innerHTML;
    e.currentTarget.innerHTML = '<span class="material-symbols-outlined text-[16px] text-secondary">check</span>';
    const target = e.currentTarget;
    setTimeout(() => {
      target.innerHTML = originalContent;
    }, 1500);
  };

  return (
    <DashboardLayout title="Accounts">
      {/* Container wrapper using dynamic grid paddings */}
      <section className="p-4 sm:p-6 lg:p-10 space-y-2xl max-w-[1400px] mx-auto w-full flex-grow box-border overflow-hidden">
        
        {/* Page Header Stack Optimization */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md sm:gap-lg">
          <div className="flex flex-col gap-[20px]">
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface">Account Management</h2>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant">
              Manage your digital asset containers, monitor performance, and configure security protocols.
            </p>
          </div>
          <button 
            onClick={handleCreateAccount}
            disabled={creatingAccount}
            className="w-full sm:w-auto flex items-center justify-center gap-xs px-md py-2.5 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0 text-center"
          >
            <span className="material-symbols-outlined text-[20px]">
              {creatingAccount ? 'sync' : 'add'}
            </span>
            <span className="whitespace-nowrap">{creatingAccount ? 'Creating...' : 'Create New Wallet Account'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-md bg-error-container/20 border border-error/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm">
            <span className="font-body-md text-error text-sm sm:text-base">{error}</span>
            <button onClick={fetchAccounts} className="px-sm py-1 bg-error-container text-on-error-container rounded font-label-sm shrink-0 self-end sm:self-auto">Retry</button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card inner-stroke rounded-2xl p-md sm:p-lg flex flex-col gap-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="w-1/2 h-6 bg-surface-container-highest rounded"></div>
                  <div className="w-16 h-6 bg-surface-container-highest rounded-full"></div>
                </div>
                <div className="space-y-sm">
                  <div className="w-1/3 h-4 bg-surface-container-highest rounded"></div>
                  <div className="w-full h-10 bg-surface-container-highest rounded-lg"></div>
                </div>
                <div className="w-full h-8 bg-surface-container-highest rounded pt-sm"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Accounts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md sm:gap-lg">
            {accounts.length === 0 ? (
              <div className="col-span-full glass-card inner-stroke rounded-2xl p-lg sm:p-xl text-center flex flex-col items-center gap-md">
                <span className="material-symbols-outlined text-outline text-5xl">account_balance_wallet</span>
                <h3 className="font-headline-md text-xl sm:text-headline-md text-on-surface">No accounts found</h3>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-sm">
                  You don't have any wallet accounts yet. Click the button above to create your first container.
                </p>
              </div>
            ) : (
              accounts.map((acc, index) => {
                const balState = balanceStates[acc._id] || { revealed: false, balance: null, loading: false };
                return (
                  <div 
                    key={acc._id} 
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsFrozen(acc.status === 'FROZEN');
                    }}
                    className={`glass-card inner-stroke rounded-2xl p-md sm:p-lg flex flex-col gap-md sm:gap-lg group hover:bg-surface-container-high/50 transition-all duration-300 cursor-pointer ${
                      selectedAccount?._id === acc._id ? 'border-primary/55 ring-1 ring-primary/20' : ''
                    } ${acc.status === 'CLOSED' ? 'opacity-60 bg-error/5 border-error/10' : ''}`}
                  >
                    {/* Header Section: Responsive Breakpoints Configured */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-sm sm:gap-md">
                      <div className="w-full sm:w-auto min-w-0">
                        <h3 className="font-headline-md text-lg sm:text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">
                          {index === 0 ? 'Primary Wallet' : index === 1 ? 'Yield Reserve' : `Wallet Account ${index + 1}`}
                        </h3>
                        <div className="flex items-center gap-xs sm:gap-sm mt-1 flex-wrap" onClick={e => e.stopPropagation()}>
                          <span className="font-label-md text-xs sm:text-label-md text-on-surface-variant/70 tracking-widest break-all">
                            {acc._id}
                          </span>
                          <button 
                            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                            onClick={(e) => handleCopy(acc._id, e)}
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-label-sm font-semibold tracking-wider uppercase border self-start sm:self-auto shrink-0 ${
                        acc.status === 'ACTIVE' 
                          ? 'bg-secondary-container/10 text-secondary border-secondary-container/20' 
                          : acc.status === 'FROZEN'
                          ? 'bg-tertiary-container/10 text-tertiary border-tertiary-container/20'
                          : 'bg-error-container/10 text-error border-error-container/20'
                      }`}>
                        {acc.status}
                      </span>
                    </div>

                    {/* Balance Section */}
                    <div className="flex flex-col gap-xs" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-end">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Available Balance</span>
                        <button 
                          onClick={() => handleToggleBalance(acc._id)}
                          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {balState.revealed ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      <div className="h-10 relative flex items-center overflow-hidden">
                        {!balState.revealed && !balState.loading && (
                          <div className="skeleton absolute inset-0 rounded-lg"></div>
                        )}
                        {balState.loading && (
                          <div className="absolute inset-0 flex items-center text-primary text-sm font-mono animate-pulse">
                            Fetching Ledger...
                          </div>
                        )}
                        {balState.revealed && !balState.loading && (
                          <div className="font-display text-[22px] sm:text-[28px] text-on-surface tracking-tight animate-fadeIn truncate w-full">
                            {acc.currency === 'USD' ? '$' : (acc.currency || 'PKR') + ' '}{balState.balance !== null && balState.balance !== undefined ? Number(balState.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="flex items-center gap-sm pt-sm border-t border-on-surface/5 mt-auto">
                      <div className="flex -space-x-2 shrink-0">
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">PKR</div>
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white">USDT</div>
                      </div>
                      <span className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant ml-auto truncate">
                        Created {new Date(acc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Bento Style Settings Section */}
        {selectedAccount && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md sm:gap-lg animate-fadeIn">
            {/* Security & Limits Component Box */}
            <div className="lg:col-span-8 glass-card inner-stroke rounded-3xl p-md sm:p-lg lg:p-xl space-y-lg sm:space-y-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                <div className="flex items-center gap-sm sm:gap-md w-full min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary-container">security</span>
                  </div>
                  <div className="min-w-0 w-full">
                    <h3 className="font-headline-md text-lg sm:text-headline-md text-on-surface truncate">Security &amp; Limits</h3>
                    <p className="font-label-md text-xs sm:text-label-md text-on-surface-variant truncate">
                      Currently viewing policy for: <span className="font-mono font-bold break-all">{selectedAccount._id}</span>
                    </p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-md py-2 border border-outline-variant/30 rounded-xl font-label-md hover:bg-surface-variant transition-colors cursor-pointer text-sm whitespace-nowrap shrink-0">
                  Modify Policy
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md sm:gap-xl pt-sm sm:pt-md">
                {/* Limits Dynamic Tracker */}
                <div className="space-y-md p-md sm:p-lg bg-surface-container rounded-2xl border border-outline-variant/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
                    <span className="font-label-md text-sm sm:text-label-md text-on-surface">Daily Transaction Limit</span>
                    <span className="font-headline-md text-xl sm:text-headline-md text-primary">$10,000.00</span>
                  </div>
                  <div className="relative w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary w-[45%] rounded-full shadow-[0_0_12px_rgba(195,192,255,0.4)]"></div>
                  </div>
                  <div className="flex justify-between font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant">
                    <span>Used: $4,500.00</span>
                    <span>Remaining: $5,500.00</span>
                  </div>
                </div>

                {/* Switch Controls Group */}
                <div className="space-y-md sm:space-y-lg flex flex-col justify-center">
                  {/* Freeze switch */}
                  <div className="flex items-center justify-between group gap-md">
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-sm sm:text-label-md text-on-surface group-hover:text-primary transition-colors truncate">Freeze Account</span>
                      <span className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant line-clamp-1">Instantly block outgoing flows</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isFrozen}
                        onChange={() => setIsFrozen(!isFrozen)}
                      />
                      <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
                    </label>
                  </div>

                  {/* International switch */}
                  <div className="flex items-center justify-between group gap-md">
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-sm sm:text-label-md text-on-surface group-hover:text-primary transition-colors truncate">International Transactions</span>
                      <span className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant line-clamp-1">Allow transfers outside region</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={allowInternational}
                        onChange={() => setAllowInternational(!allowInternational)}
                      />
                      <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar protection card group */}
            <div className="lg:col-span-4 flex flex-col gap-md sm:gap-lg">
              <div className="glass-card inner-stroke rounded-3xl p-md sm:p-lg flex-1 flex flex-col gap-md relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                <h4 className="font-headline-md text-lg sm:text-headline-md text-on-surface z-10">Advanced Protection</h4>
                <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant z-10">
                  Upgrade to Multi-Sig for enterprise wallets to enable 2-of-3 approval flows for all high-value transactions.
                </p>
                <button className="mt-4 sm:mt-auto w-full py-3 bg-surface-container-highest border border-primary/20 rounded-xl font-label-md text-primary hover:bg-primary/5 transition-all cursor-pointer text-sm">
                  Enable Multi-Sig Vault
                </button>
              </div>

              <div className="bg-primary-container rounded-3xl p-md sm:p-lg flex items-center gap-md sm:gap-lg">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[28px] sm:text-[32px]">contact_support</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline-md text-[16px] sm:text-[18px] text-white truncate">Need help?</h4>
                  <p className="font-label-sm text-xs sm:text-label-sm text-white/80 line-clamp-1">Connect with your advisor for limit increases.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer Element UI Fixes */}
      <footer className="w-full py-lg px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant/10 gap-md">
        <div className="flex flex-col gap-xs text-center sm:text-left">
          <span className="font-label-md text-sm sm:text-label-md font-bold text-primary">ApexWallet Solutions</span>
          <span className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant">© {new Date().getFullYear()} ApexWallet Solutions. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-md sm:gap-xl">
          <a className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#privacy">Privacy Policy</a>
          <a className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#terms">Terms of Service</a>
          <a className="font-label-sm text-xs sm:text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#support">Contact Support</a>
        </div>
      </footer>
    </DashboardLayout>
  );
}

export default Accounts;