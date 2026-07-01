import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// Generate simple unique keys for transaction idempotency
const generateIdempotencyKey = () => {
  return 'idemp-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

function Transactions() {
  const { user } = useAuth();
  const [userAccounts, setUserAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Selected Transaction Modal
  const [selectedTx, setSelectedTx] = useState(null);

  // New Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Fetch user accounts so they can select "From Account" in transfer modal
  const fetchUserAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await API.get('/api/accounts');
      const list = res.data.accounts || [];
      setUserAccounts(list);
      if (list.length > 0) {
        setFromAccount(list[0]._id);
      }
      // Fetch transaction history after accounts list is ready (for Debit/Credit mapping)
      await fetchTransactions(list);
    } catch (err) {
      console.error('Error fetching accounts for transfer:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchTransactions = async (accountsList) => {
    try {
      setLoadingTransactions(true);
      const response = await API.get('/api/transactions');
      if (typeof response.data !== 'object' || !response.data || !response.data.transactions) {
        console.warn('API returned non-JSON or unexpected structure. Falling back to local data.');
        return;
      }
      const list = response.data.transactions || [];
      const userAccountIds = accountsList.map(acc => String(acc._id));

      const mapped = list.map(tx => {
        const dateObj = new Date(tx.createdAt);
        const fromId = String(tx.fromAccount?._id || tx.fromAccount || '');
        const toId = String(tx.toAccount?._id || tx.toAccount || '');
        const isDebit = userAccountIds.includes(fromId);
        return {
          id: tx._id,
          idempotencyKey: tx.idempotencyKey || 'N/A',
          type: isDebit ? 'DEBIT' : 'CREDIT',
          amount: tx.amount,
          status: tx.status,
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: dateObj.toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
          fromAccount: fromId || 'N/A',
          toAccount: toId || 'N/A',
          entryId: `LGR-${String(tx._id).slice(-8).toUpperCase()}-A`,
          fee: isDebit ? 12.45 : 0.00
        };
      });
      setTransactions(mapped);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  // Update list with filters applied
  useEffect(() => {
    let result = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.id.toLowerCase().includes(q) || 
        tx.idempotencyKey.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All Status') {
      result = result.filter(tx => tx.status === statusFilter);
    }

    if (typeFilter !== 'All Types') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    setFilteredTransactions(result);
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const handleOpenTransferModal = () => {
    setTransferError('');
    setAmount('');
    setToAccount('');
    setIsTransferModalOpen(true);
    fetchUserAccounts();
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    setTransferError('');

    if (!user?.systemUser && !fromAccount) {
      setTransferError('Please select a source account.');
      return;
    }
    if (!toAccount || !amount) {
      setTransferError('Please fill out all fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    try {
      setIsSubmittingTransfer(true);
      const key = generateIdempotencyKey();
      
      if (user?.systemUser) {
        // System user transfers (initial-funds route) - no balance check
        await API.post('/api/transactions/system/initial-funds', {
          toAccount,
          amount: numericAmount,
          idempotencyKey: key
        });
      } else {
        // Normal user transfers - subject to standard limits and balance checks
        await API.post('/api/transactions', {
          fromAccount,
          toAccount,
          amount: numericAmount,
          idempotencyKey: key
        });
      }

      console.log("User:", user);
      console.log("systemUser:", user?.systemUser);

      // Fetch fresh transactions from database
      await fetchTransactions(userAccounts);
      setIsTransferModalOpen(false);
    } catch (err) {
      console.error('Transfer execution error:', err);
      setTransferError(err.response?.data?.message || 'Transfer failed. Check recipient account or balance.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Idempotency Key', 'Type', 'Amount', 'Status', 'Date', 'Time'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.idempotencyKey,
      tx.type,
      tx.amount,
      tx.status,
      tx.date,
      tx.time
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apex_transaction_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="flex-1 flex flex-col min-w-0 h-full bg-background custom-scrollbar overflow-y-auto overflow-x-hidden">
        <section className="p-4 sm:p-6 lg:p-10 space-y-lg sm:space-y-xl max-w-[1400px] mx-auto w-full min-w-0 flex-grow">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
            <div>
              <h2 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">Transaction Ledger</h2>
              <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mt-xs">
                Real-time trade execution and system funds ledger flow history.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-sm w-full sm:w-auto">
              <button 
                onClick={exportCSV}
                className="flex-1 sm:flex-none justify-center bg-surface-container-high border border-outline-variant/30 text-on-surface px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-surface-variant transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-md">download</span>
                Export CSV
              </button>
              <button 
                onClick={handleOpenTransferModal}
                className="flex-1 sm:flex-none justify-center bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-md">add</span>
                New Transfer
              </button>
            </div>
          </div>

          {/* Outflow / Inflow Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md sm:gap-lg">
            {/* Debits Card */}
            <div className="glass-panel p-md sm:p-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-error/10 rounded-full blur-3xl group-hover:bg-error/20 transition-all duration-700"></div>
              <div className="flex justify-between items-start mb-md">
                <div className="p-sm bg-error/10 rounded-lg">
                  <span className="material-symbols-outlined text-error">call_made</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">30 Day Outflow</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Total Money Sent (Debits)</p>
              <div className="flex items-baseline gap-xs mt-sm flex-wrap">
                <span className="font-display text-2xl sm:text-display text-on-surface break-all">
                  ${transactions.filter(t => t.type === 'DEBIT' && t.status === 'COMPLETED').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                </span>
                <span className="font-body-md text-body-md text-error flex items-center">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  12%
                </span>
              </div>
            </div>

            {/* Credits Card */}
            <div className="glass-panel p-md sm:p-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
              <div className="flex justify-between items-start mb-md">
                <div className="p-sm bg-secondary/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">call_received</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">30 Day Inflow</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Total Money Received (Credits)</p>
              <div className="flex items-baseline gap-xs mt-sm flex-wrap">
                <span className="font-display text-2xl sm:text-display text-on-surface break-all">
                  ${transactions.filter(t => t.type === 'CREDIT' && t.status === 'COMPLETED').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                </span>
                <span className="font-body-md text-body-md text-secondary flex items-center">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  24%
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="glass-panel p-md rounded-xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-md">
            <div className="flex-1 min-w-0 sm:min-w-[280px] relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-md">search</span>
              <input 
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:ring-1 focus:ring-primary transition-all font-body-md text-sm sm:text-body-md" 
                placeholder="Search by Transaction ID or Idempotency Key..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-sm">
              <div className="relative flex-1 min-w-[130px] sm:flex-none sm:min-w-0">
                <select 
                  className="w-full appearance-none bg-surface-container-highest border border-outline-variant/20 rounded-lg py-2.5 pl-4 pr-10 text-on-surface font-label-md text-label-md focus:ring-1 focus:ring-primary sm:min-w-[140px] cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>COMPLETED</option>
                  <option>PENDING</option>
                  <option>FAILED</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
              
              <div className="relative flex-1 min-w-[130px] sm:flex-none sm:min-w-0">
                <select 
                  className="w-full appearance-none bg-surface-container-highest border border-outline-variant/20 rounded-lg py-2.5 pl-4 pr-10 text-on-surface font-label-md text-label-md focus:ring-1 focus:ring-primary sm:min-w-[140px] cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>DEBIT</option>
                  <option>CREDIT</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>

              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All Status');
                  setTypeFilter('All Types');
                }}
                className="text-on-surface-variant hover:text-on-surface p-2.5 transition-colors cursor-pointer shrink-0"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[720px]">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-outline-variant/20">
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Transaction ID</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                    <th className="px-lg py-md"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loadingTransactions ? (
                    <tr>
                      <td colSpan="6" className="px-lg py-xl text-center text-primary font-mono text-sm animate-pulse">
                        Fetching Ledger Entries...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-lg py-xl text-center text-on-surface-variant font-mono text-sm">
                        No ledger entries match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr 
                        key={tx.id} 
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <td className="px-lg py-xl">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-xs">
                              <span className="font-label-md text-label-md text-on-surface">{tx.id}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(tx.id);
                                }}
                                className="text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-primary transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant/60 font-mono">
                              IDEMP: {tx.idempotencyKey.substr(0, 14)}...
                            </span>
                          </div>
                        </td>
                        <td className="px-lg py-xl">
                          <span className={`inline-flex items-center px-sm py-xs rounded font-label-sm text-label-sm font-bold border ${
                            tx.type === 'DEBIT' 
                              ? 'bg-error/10 text-error border-error/20' 
                              : 'bg-secondary/10 text-secondary border-secondary/20'
                          }`}>
                            {tx.type} {tx.type === 'DEBIT' ? '-' : '+'}
                          </span>
                        </td>
                        <td className="px-lg py-xl text-right">
                          <span className={`font-label-md text-label-md font-bold ${tx.type === 'DEBIT' ? 'text-on-surface' : 'text-secondary'}`}>
                            {tx.type === 'DEBIT' ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-lg py-xl">
                          <div className="flex items-center gap-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              tx.status === 'COMPLETED' 
                                ? 'bg-secondary shadow-[0_0_8px_#4edea3]' 
                                : tx.status === 'PENDING'
                                ? 'bg-tertiary shadow-[0_0_8px_#ffb95f]'
                                : 'bg-error shadow-[0_0_8px_#ffb4ab]'
                            }`}></div>
                            <span className={`font-label-md text-label-md ${
                              tx.status === 'COMPLETED' 
                                ? 'text-secondary' 
                                : tx.status === 'PENDING'
                                ? 'text-tertiary'
                                : 'text-error'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-lg py-xl">
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface">{tx.date}</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">{tx.time}</span>
                          </div>
                        </td>
                        <td className="px-lg py-xl text-right">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-md sm:px-lg py-md border-t border-outline-variant/10 bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {filteredTransactions.length} of {transactions.length} entries
              </span>
              <div className="flex gap-xs">
                <button className="p-xs rounded bg-surface-variant hover:bg-outline-variant/20 disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="px-sm rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm">1</button>
                <button className="p-xs rounded bg-surface-variant hover:bg-outline-variant/20 disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className=" rounded-2xl overflow-hidden shadow-3xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="p-md sm:p-lg border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-high/50 gap-sm">
              <div className="min-w-0">
                <h3 className="font-headline-md text-lg sm:text-headline-md text-on-surface">Transaction Details</h3>
                <p className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-mono truncate">{selectedTx.id}</p>
              </div>
              <button 
                className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors cursor-pointer shrink-0"
                onClick={() => setSelectedTx(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-md sm:p-lg space-y-lg sm:space-y-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md sm:gap-lg">
                <div className="space-y-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">From Account ID</span>
                  <div className="flex items-center gap-xs font-mono text-sm text-on-surface break-all">
                    <span>{selectedTx.fromAccount}</span>
                  </div>
                </div>
                <div className="space-y-xs sm:text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">To Account ID</span>
                  <div className="flex items-center sm:justify-end gap-xs font-mono text-sm text-on-surface break-all">
                    <span>{selectedTx.toAccount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-variant/30 rounded-xl p-md border border-outline-variant/10 space-y-md">
                <div className="flex justify-between items-center gap-sm">
                  <span className="font-body-md text-sm sm:text-body-md text-on-surface-variant">Ledger Entry ID</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono truncate">{selectedTx.entryId}</span>
                </div>
                <div className="flex justify-between items-center gap-sm">
                  <span className="font-body-md text-sm sm:text-body-md text-on-surface-variant">Execution Venue</span>
                  <span className="font-label-md text-label-md text-on-surface text-right">Apex Internal Routing</span>
                </div>
                <div className="flex justify-between items-center gap-sm">
                  <span className="font-body-md text-sm sm:text-body-md text-on-surface-variant">Amount</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono">{selectedTx.amount} PKR</span>
                </div>
                <div className="flex justify-between items-center gap-sm">
                  <span className="font-body-md text-sm sm:text-body-md text-on-surface-variant shrink-0">Idempotency Key</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-mono select-all text-right max-w-[160px] sm:max-w-[200px] truncate">{selectedTx.idempotencyKey}</span>
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                <button className="w-full bg-primary text-on-primary-fixed-variant font-label-md text-label-md font-bold py-md rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-sm cursor-pointer">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Download Receipt (PDF)
                </button>
                <button className="w-full border border-outline-variant text-on-surface font-label-md text-label-md py-md rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-sm cursor-pointer">
                  <span className="material-symbols-outlined">share</span>
                  Share Transaction Link
                </button>
              </div>
            </div>

            <div className="px-md sm:px-lg py-md bg-surface-container-high/30 border-t border-outline-variant/10">
              <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                Immutable record signed via Apex Ledger Protocol.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card sm:w-[75%] lg:w-[50%] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-8 relative shadow-2xl border border-[#464555] animate-fadeIn">
            <button 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
              onClick={() => setIsTransferModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#dae2fd] mb-6 text-center pr-8">Execute Fund Transfer</h2>
            
            {transferError && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error/30 rounded-xl text-error font-label-sm text-xs">
                {transferError}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Source Account</label>
                {user?.systemUser ? (
                  <div className="w-full bg-[#1e293b] rounded-xl border border-error/35 text-error px-4 py-3 font-mono text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0">lock_open</span>
                    <span>System Ledger Source (Direct Adjustment - No limits)</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select 
                      className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-3 appearance-none cursor-pointer text-sm"
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      required
                    >
                      {loadingAccounts ? (
                        <option>Loading Accounts...</option>
                      ) : userAccounts.length === 0 ? (
                        <option>No active accounts found</option>
                      ) : (
                        userAccounts.map(acc => (
                          <option key={acc._id} value={acc._id}>
                            {acc._id} ({acc.status})
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Recipient Account ID</label>
                <input 
                  className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-3 font-mono text-sm"
                  placeholder="Enter 24-character Account ID" 
                  type="text"
                  required
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value.trim())}
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-mono">$</span>
                  <input 
                    className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] pl-8 pr-4 py-3 font-mono"
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmittingTransfer || userAccounts.length === 0}
                className="w-full py-3 bg-[#4f46e5] text-white rounded-xl font-semibold hover:opacity-90 transition-all mt-6 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTransfer ? 'Processing Transfer...' : 'Initiate Secure Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Transactions;