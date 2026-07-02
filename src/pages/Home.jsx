import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="selection:bg-primary/30 min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant">
  <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 max-w-[1400px] mx-auto">
    <div className="flex items-center gap-sm">
      <span
        className="material-symbols-outlined text-primary text-2xl md:text-3xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        account_balance_wallet
      </span>
      <span className="font-headline-md text-lg md:text-headline-md font-bold text-primary tracking-tight">
        ApexWallet
      </span>
    </div>

    {/* Desktop links */}
    <div className="hidden md:flex items-center gap-lg">
      <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#features">
        Features
      </a>
      <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#security">
        Security
      </a>
      <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#pricing">
        Pricing
      </a>
    </div>

    {/* Desktop buttons */}
    <div className="hidden md:flex items-center gap-md">
      <Link
        className="px-md py-sm rounded-xl border border-outline text-on-surface hover:bg-surface-variant/50 transition-all active:scale-95 font-label-md"
        to="/login"
      >
        Login
      </Link>
      <Link
        className="px-md py-sm rounded-xl bg-primary-container text-on-primary-container font-label-md hover:opacity-90 transition-all active:scale-95 shadow-md"
        to="/register"
      >
        Open Free Account
      </Link>
    </div>

    {/* Mobile: compact CTA + hamburger */}
    <div className="flex md:hidden items-center gap-sm">
      <Link
        className="px-sm py-xs rounded-lg bg-primary-container text-on-primary-container font-label-md text-sm hover:opacity-90 transition-all active:scale-95 shadow-md whitespace-nowrap"
        to="/register"
      >
        Sign up
      </Link>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-variant/50 transition-colors active:scale-95"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="material-symbols-outlined text-on-surface text-2xl">
          {menuOpen ? 'close' : 'menu'}
        </span>
      </button>
    </div>
  </nav>

  {/* Mobile dropdown panel */}
  <div
    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-outline-variant bg-surface-container ${
      menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div className="flex flex-col px-margin-mobile py-md gap-md">
         <a   
        className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-sm"
        href="#features"
        onClick={() => setMenuOpen(false)}
      >
        Features
      </a>
           <a 
        className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-sm"
        href="#security"
        onClick={() => setMenuOpen(false)}
      >
        Security
      </a>
      <a
        className="font-label-md text-on-surface-variant hover:text-primary transition-colors py-sm"
        href="#pricing"
        onClick={() => setMenuOpen(false)}
      >
        Pricing
      </a>
      <Link
        className="px-md py-sm rounded-xl border border-outline text-on-surface text-center font-label-md mt-sm"
        to="/login"
        onClick={() => setMenuOpen(false)}
      >
        Login
      </Link>
    </div>
  </div>
</header>

      <main className="pt-16 gradient-mesh flex-grow">
        {/* Hero Section */}
        <section className="relative px-margin-mobile md:px-margin-desktop pt-2xl pb-3xl max-w-[1400px] mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="space-y-lg z-10">
              <div className="inline-flex items-center px-sm py-1 rounded-full bg-secondary-container/10 border border-secondary-container/20 text-secondary text-label-sm uppercase tracking-wider mb-base">
                <span className="material-symbols-outlined text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                New: v2.4 Immutable Ledger Live
              </div>
              <h1 className="text-[30px] sm:font-display sm:text-display text-on-surface leading-tight">
                The Ultra-Secure Ledger Wallet for <span className="text-secondary">Seamless Transactions.</span>
              </h1>
              <p>
                Experience instant, double-spend protected transfers backed by an immutable ledger system. Create an account in under 60 seconds.
              </p>
              <div className="flex flex-wrap gap-md pt-md">
                <Link 
                  className="px-xl py-md rounded-xl bg-primary-container text-on-primary-container font-headline-md hover:bg-primary-container/90 transition-all emerald-glow flex items-center gap-sm" 
                  to="/register"
                >
                  Get Started Now
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a 
                  className="px-xl py-md rounded-xl border-2 border-outline-variant text-on-surface font-headline-md hover:bg-surface-variant/50 transition-all text-center flex items-center justify-center"
                  href="#features"
                >
                  Explore Features
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full"></div>
              <div className="glass-card rounded-2xl p-sm bento-inner-shadow transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  className="w-full h-auto rounded-xl shadow-2xl" 
                  alt="A high-fidelity fintech dashboard UI mockup showing a secure ledger balance of 48,290.00 USD." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATfOK8fT8MM_SKQ-yv40_fjrp2Lb93P2k_thIIWOQy-mItK5IQHdp2MLE8__5MLWNz1olAg8QjdzoPS_kKgc-v72Bd81KYMh5yv9eI7tTe4eFQBt_km-fvP-tLvYI9C70IBB7-sKVCmrxPL-10wyIjs8mWsnUU6HG7cQcAOwW8aEA6IqiiLMQ4qCsO9cMahP0j1ZUFZIv7BmWsMvf7t5nYy9N_dfyj6g7wInf3JdyKRgJDiOY2ARq8WHAhA06uF9cS9Cx3gtElE16u"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Trust Banner */}
        <section id="security" className="bg-surface-container-low py-xl border-y border-outline-variant/30">
          <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-wrap justify-around items-center gap-lg opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">lock</span>
                <span className="font-label-md uppercase tracking-widest text-on-surface">JWT Secured</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">shield_person</span>
                <span className="font-label-md uppercase tracking-widest text-on-surface">Encrypted Sessions</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">notifications_active</span>
                <span className="font-label-md uppercase tracking-widest text-on-surface">Real-time Email Alerts</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-2xl">database</span>
                <span className="font-label-md uppercase tracking-widest text-on-surface">Immutable Ledger</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Bento Grid Style) */}
        <section id="features" className="py-3xl px-margin-mobile md:px-margin-desktop max-w-[1400px] mx-auto">
          <div className="text-center mb-2xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Engineered for Reliability</h2>
            <p cl>Our proprietary Apex Ledger Architecture ensures that every micro-transaction is handled with institutional-grade precision.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-lg">
            {/* Feature 1 */}
            <div className="glass-card p-lg rounded-2xl flex flex-col gap-md group hover:bg-surface-container transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_lock
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Idempotent Transfers</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Never worry about network drops or double-deductions. Our system ensures every payment safely processes exactly once.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="glass-card p-lg rounded-2xl flex flex-col gap-md group hover:bg-surface-container transition-all border-t-2 border-t-secondary/30">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  receipt
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Ledger-Backed Security</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Every debit and credit is recorded on an immutable ledger sheet, ensuring absolute balance transparency and auditing.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="glass-card p-lg rounded-2xl flex flex-col gap-md group hover:bg-surface-container transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Flexible Accounts</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Create and manage multiple wallet accounts effortlessly under a single secure profile with distinct access keys.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-2xl border-t border-outline-variant/30 mt-auto">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-center gap-lg">
            <div className="flex flex-col items-center md:items-start gap-xs">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1'" }}>
                  account_balance_wallet
                </span>
                <span className="font-headline-md text-headline-md text-primary font-bold">ApexWallet</span>
              </div>
              <p className="font-label-sm text-on-surface-variant opacity-60">© {new Date().getFullYear()} ApexWallet. All rights reserved.</p>
            </div>
            <div className="flex gap-xl font-label-md text-on-surface-variant">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            </div>
            <div className="text-center md:text-right">
              <p className="font-label-md text-on-surface-variant italic">Powered by Apex Ledger Architecture.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
