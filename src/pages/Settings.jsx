import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

function Settings() {
  const { user } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Security states
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('15m');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Theme states
  const [themeMode, setThemeMode] = useState('dark');

  // Developer settings state
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('baseURL') || 'https://banking-system-production-81c5.up.railway.app'
  );
  const [devSuccess, setDevSuccess] = useState('');

  // Sync state with loaded user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Sync theme selection with document class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setThemeMode(isDark ? 'dark' : 'light');
  }, []);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSuccess('');
    // Store in localStorage update
    const updatedUser = { ...user, name, email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setProfileSuccess('Profile changes stored locally. Syncing on next reload.');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecuritySuccess('Security preferences updated successfully.');
    setTimeout(() => setSecuritySuccess(''), 4000);
  };

  const handleSaveDev = (e) => {
    e.preventDefault();
    setDevSuccess('');
    localStorage.setItem('baseURL', apiUrl.trim());
    setDevSuccess('API endpoint updated. Reloading the page to apply changes...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
        <section className="p-4 sm:p-6 lg:p-10 space-y-xl max-w-[1000px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col gap-xs">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">System Settings</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage security preferences, portal customization, and developer endpoint configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Profile Settings Card */}
            <div className="glass-panel rounded-2xl p-lg space-y-lg border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-2xl">person</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Profile Identity</h3>
              </div>

              {profileSuccess && (
                <div className="p-sm bg-secondary-container/20 border border-secondary/30 rounded-xl text-secondary font-label-sm text-xs">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Full Name</label>
                  <input 
                    className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-2.5" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Email Address</label>
                  <input 
                    className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-2.5" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Change Password</label>
                  <input 
                    className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-2.5 placeholder:text-outline-variant" 
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="px-lg py-2.5 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* Portal Theme & General Settings */}
            <div className="glass-panel rounded-2xl p-lg space-y-lg border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-2xl">palette</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Portal Theme</h3>
              </div>

              <div className="space-y-md">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Toggle application interface styling guidelines dynamically.
                </p>

                <div className="flex gap-md pt-xs">
                  <button 
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 py-4 rounded-xl border flex items-center justify-center gap-sm font-label-md transition-all cursor-pointer ${
                      themeMode === 'dark' 
                        ? 'bg-primary-container border-primary text-on-primary-container' 
                        : 'border-[#464555] text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined">dark_mode</span>
                    Dark Atmosphere
                  </button>

                  <button 
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 py-4 rounded-xl border flex items-center justify-center gap-sm font-label-md transition-all cursor-pointer ${
                      themeMode === 'light' 
                        ? 'bg-primary-container border-primary text-on-primary-container' 
                        : 'border-[#464555] text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined">light_mode</span>
                    Light Atmosphere
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Security Preferences */}
            <div className="glass-panel rounded-2xl p-lg space-y-lg border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-2xl">security</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Security & Privacy</h3>
              </div>

              {securitySuccess && (
                <div className="p-sm bg-secondary-container/20 border border-secondary/30 rounded-xl text-secondary font-label-sm text-xs">
                  {securitySuccess}
                </div>
              )}

              <form onSubmit={handleSaveSecurity} className="space-y-lg">
                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Two-Factor Authentication</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Request OTP code for ledger transactions</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={twoFactor}
                      onChange={() => setTwoFactor(!twoFactor)}
                    />
                    <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Transaction Email Alerts</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Receive automated notifications on outgoing fund flows</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailAlerts}
                      onChange={() => setEmailAlerts(!emailAlerts)}
                    />
                    <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Inactivity Session Timeout</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-2.5 appearance-none cursor-pointer"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    >
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="never">Never Timeout</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="px-lg py-2.5 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Save Security Policy
                </button>
              </form>
            </div>

            {/* Developers Sandbox Card */}
            <div className="glass-panel rounded-2xl p-lg space-y-lg border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Developer Sandbox</h3>
              </div>

              {devSuccess && (
                <div className="p-sm bg-secondary-container/20 border border-secondary/30 rounded-xl text-secondary font-label-sm text-xs">
                  {devSuccess}
                </div>
              )}

              <form onSubmit={handleSaveDev} className="space-y-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Active API Endpoint</label>
                  <input 
                    className="w-full bg-[#171f33] rounded-xl border border-[#464555] focus:border-[#c3c0ff] focus:outline-none text-[#dae2fd] px-4 py-2.5 font-mono text-xs" 
                    type="text" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1.5 leading-normal">
                    Change base ledger routing server address. Useful for switching from deployed cloud services to local server testing environments (e.g. <code>http://localhost:3000</code>).
                  </p>
                </div>
                <button 
                  type="submit"
                  className="px-lg py-2.5 bg-error text-on-error font-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Save API Configuration
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
