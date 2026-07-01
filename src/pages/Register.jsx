import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successCircleScale, setSuccessCircleScale] = useState(false);

  // Validation states
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: 'Weak',
    colorClass: 'text-outline',
    barColors: ['bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant']
  });

  const handleEmailChange = (val) => {
    setEmail(val);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(val)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (val.length === 0) {
      setPasswordStrength({
        score: 0,
        text: 'Weak',
        colorClass: 'text-outline',
        barColors: ['bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant']
      });
      return;
    }

    let score = 0;
    if (val.length > 5) score++;
    if (val.length > 8) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['bg-error', 'bg-tertiary', 'bg-primary-container', 'bg-secondary'];
    const labels = ['Weak', 'Moderate', 'Strong', 'Secure'];
    const textColors = ['text-error', 'text-tertiary', 'text-primary', 'text-secondary'];

    const currentScore = score || 1;
    const barColors = ['bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant', 'bg-outline-variant'];
    for (let i = 0; i < currentScore; i++) {
      barColors[i] = colors[currentScore - 1];
    }

    setPasswordStrength({
      score: currentScore,
      text: labels[currentScore - 1],
      colorClass: textColors[currentScore - 1],
      barColors
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    // Simulate API request to backend (POST /api/auth/register)
    setTimeout(() => {
      if (email.includes('taken') || email === 'taken@apex.com') {
        setIsSubmitting(false);
        setErrorText('This email address is already associated with an account.');
      } else {
        // Success state simulation
        setIsSubmitting(false);
        setShowSuccessOverlay(true);
        setTimeout(() => {
          setSuccessCircleScale(true);
          // Redirect to home/login after a brief delay
          setTimeout(() => {
            alert(`Account created successfully! Redirecting... (User: ${name})`);
            navigate('/login');
          }, 1500);
        }, 100);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md overflow-x-hidden bg-[#0b1326] text-[#dae2fd]">
      {/* Success Feedback Overlay */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl transition-opacity duration-700 ${
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

          {/* Register View */}
          <div className="auth-transition opacity-100 translate-x-0">
            <div className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Create Your Account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Join the future of global finance.</p>
            </div>

            <form className="space-y-md" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-sm ml-xs">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all input-focus-ring" 
                    placeholder="John Doe" 
                    required 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

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
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                </div>
                {emailValid && (
                  <div className="mt-2 animate-fade-in">
                    <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Email address looks good
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-sm ml-xs">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-outline-variant border rounded-xl py-3.5 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary transition-all input-focus-ring" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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

                {/* Strength Meter */}
                <div className="mt-3 px-xs">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Security Strength</span>
                    <span className={`font-label-sm text-label-sm ${passwordStrength.colorClass}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full w-1/4 ${passwordStrength.barColors[0]} transition-colors`}></div>
                    <div className={`h-full w-1/4 ${passwordStrength.barColors[1]} transition-colors`}></div>
                    <div className={`h-full w-1/4 ${passwordStrength.barColors[2]} transition-colors`}></div>
                    <div className={`h-full w-1/4 ${passwordStrength.barColors[3]} transition-colors`}></div>
                  </div>
                </div>
              </div>

              <p className="font-label-sm text-label-sm text-on-surface-variant px-xs leading-relaxed">
                By creating an account, you agree to our <a className="text-primary hover:underline" href="#terms">Terms</a> and <a className="text-primary hover:underline" href="#privacy">Privacy Policy</a>.
              </p>

              <button 
                className="w-full mt-2 bg-primary text-on-primary font-label-md py-4 rounded-xl flex items-center justify-center gap-sm hover:bg-primary-fixed-dim active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer" 
                type="submit"
                disabled={isSubmitting}
              >
                {!isSubmitting ? (
                  <span className="btn-text">Create Account</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Initializing Wallet</span>
                    <span className="loading-dots"></span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-xl text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account? 
                <Link className="text-primary font-semibold hover:underline ml-1" to="/login">Sign In</Link>
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

export default Register;
