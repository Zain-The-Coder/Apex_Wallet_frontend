import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-background text-on-surface select-none font-body-md">
      {/* Mobile overlay backdrop, shown behind the drawer when it's open */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] md:hidden"
          onClick={closeMobileNav}
        />
      )}

      {/* SideNavBar: on mobile it's a fixed slide-in drawer; on md+ it's a static column */}
      <aside
        className={`flex flex-col h-screen fixed left-0 top-0 p-md space-y-md w-64 bg-surface-container-low border-r border-outline-variant/20 shadow-lg z-[60] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-md py-lg mb-xl">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-black text-primary">ApexWallet</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Institutional Grade</p>
            </div>
          </div>
          {/* Close button, mobile only */}
          <button
            className="md:hidden p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            onClick={closeMobileNav}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-sm">
          <NavLink 
            to="/accounts" 
            onClick={closeMobileNav}
            className={({ isActive }) => 
              `flex items-center gap-sm rounded-lg px-md py-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            <span className="font-label-md text-label-md">Accounts</span>
          </NavLink>

          <NavLink 
            to="/transactions" 
            onClick={closeMobileNav}
            className={({ isActive }) => 
              `flex items-center gap-sm rounded-lg px-md py-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-md text-label-md">Transactions</span>
          </NavLink>

          {/* Admin panel for system users */}
          {user?.systemUser && (
            <NavLink 
              to="/admin" 
              onClick={closeMobileNav}
              className={({ isActive }) => 
                `flex items-center gap-sm rounded-lg px-md py-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`
              }
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-label-md text-label-md">Users & Ledger</span>
            </NavLink>
          )}
        </nav>

        <div className="pt-xl border-t border-outline-variant/10 space-y-sm">
          <a className="flex items-center gap-sm text-on-surface-variant hover:bg-surface-variant rounded-lg px-md py-sm transition-all duration-200" href="#support">
            <span className="material-symbols-outlined">help_outline</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <NavLink 
            to="/settings" 
            onClick={closeMobileNav}
            className={({ isActive }) => 
              `flex items-center gap-sm rounded-lg px-md py-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-container text-on-primary-container shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full gap-sm px-3 sm:px-6 lg:px-margin-desktop h-16 sticky top-0 z-50 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-sm sm:gap-xl min-w-0">
            {/* Hamburger menu button, mobile only */}
            <button
              className="md:hidden p-2 shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="text-on-surface-variant text-label-md truncate min-w-0">
              <span className="hidden sm:inline">Portal <span className="mx-xs">/</span></span> <span className="text-on-surface font-bold">{title}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-xs sm:gap-md shrink-0">
            <div className="hidden sm:flex items-center gap-sm">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link to="/settings" className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">settings</span>
              </Link>
            </div>
            
            <div className="hidden sm:block h-6 w-[1px] bg-outline-variant/30 mx-sm"></div>

            <div className="flex items-center gap-xs sm:gap-sm sm:pl-sm">
              <img 
                className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover shrink-0" 
                alt="User profile avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYkdN4j4z8yyhIZa9MgsQfq_L0qQCn_JvXwVCNunuCt3reCkiRXrXVlbAFePCtgm16dBoCDnU8uqGasXhKy24zNHtlGe1xoukzma42lbEaaIb37T9wlkKZt2U-2W-PXRBjtfKZnxuXbo-H1dF8DLymUu5KFqfUsMKnV9cVLz1NrwYzt2oxf_R1nNwyDpJ_QoyWce03lB_oD7FbE5DS6Zwbwp7qIqV0GceRlYcZpos6RsrSGbVcZkHICwhqQ1wr85cHMUnkeSQbYNwZ"
              />
              <span className="font-label-md text-label-md text-on-surface hidden lg:inline">{user?.name || 'User'}</span>
              <button 
                onClick={handleLogout} 
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                title="Logout"
              >
                logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;