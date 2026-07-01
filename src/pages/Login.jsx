import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successCircleScale, setSuccessCircleScale] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    const res = await login(email, password);

    if (res.success) {
      setIsSubmitting(false);
      setShowSuccessOverlay(true);
      setTimeout(() => {
        setSuccessCircleScale(true);
        // Navigate directly to the accounts page without showing any alert popup!
        setTimeout(() => {
          navigate('/accounts');
        }, 1000);
      }, 100);
    } else {
      setIsSubmitting(false);
      setErrorText(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md overflow-x-hidden bg-[#0b1326] text-[#dae2fd]">
      {/* Success Feedback Overlay */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1326]/90 backdrop-blur-xl transition-opacity duration-700 ${
          showSuccessOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-center">
          <div 
            className={`w-24 h-24 bg-secondary-container/20 rounded-full flex items-center justify-center mx-auto mb-lg transition-transform duration-700 ease-out ${
              successCircleScale ? 'scale-100' : 'scale-50'
            }`}
          >
            <span className="material-symbols-outlined text-secondary text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Verification Successful</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Redirecting to your secure dashboard...</p>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-[480px]">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-xl">
          <Link to="/" className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-md shadow-lg glass-glow hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-on-primary-container text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">ApexWallet</h1>
          <p className="font-label-sm text-label-sm text-outline tracking-widest uppercase mt-xs">Institutional Grade Security</p>
        </div>

        {/* Auth Container */}
        <div className="auth-card rounded-3xl p-lg md:p-xl relative overflow-hidden glass-glow">
          {/* Alert Component */}
          {errorText && (
            <div className="mb-md p-md bg-error-container/20 border border-error/30 rounded-xl flex items-start gap-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-error">{errorText}</p>
              </div>
              <button className="text-error/60 hover:text-error transition-colors cursor-pointer" onClick={() => setErrorText('')}>
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Login View */}
          <div className="auth-transition opacity-100 translate-x-0">
            <div className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome Back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Sign in to manage your digital assets.</p>
            </div>
            
            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-sm ml-xs">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all input-focus-ring" 
                    placeholder="name@company.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-sm ml-xs">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#forgot">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all input-focus-ring" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer" 
                    onClick={() => setShowPassword(!showPassword)} 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-sm px-xs">
                <input 
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer" 
                  id="remember" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
              </div>

              <button 
                className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl flex items-center justify-center gap-sm hover:bg-primary-fixed-dim active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer" 
                type="submit"
                disabled={isSubmitting}
              >
                {!isSubmitting ? (
                  <span className="btn-text">Sign In</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Processing</span>
                    <span className="loading-dots"></span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-xl text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                New to ApexWallet? 
                <Link className="text-primary font-semibold hover:underline ml-1" to="/register">Create an account</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-xl grid grid-cols-2 gap-md opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center justify-center gap-2 border border-outline-variant/30 rounded-lg p-2">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-label-sm text-[10px] tracking-wider uppercase">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center justify-center gap-2 border border-outline-variant/30 rounded-lg p-2">
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span className="font-label-sm text-[10px] tracking-wider uppercase">FCA Regulated</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
