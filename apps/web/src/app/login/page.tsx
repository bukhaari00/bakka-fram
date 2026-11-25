'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { useI18n } from '../../lib/i18n/I18nContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.roleName === 'ADMIN') {
        router.push('/admin');
      } else if (user?.roleName === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli email-kaaga ama username-ka' : 'Please enter your email or username');
      return;
    }

    if (!password) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli furahaaga sirta ah' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier.trim(), password, rememberMe);

      if (result.success && result.user) {
        setSuccessMsg(locale === 'so' ? 'Guul! Waad soo gashay nidaamka...' : 'Success! Logging you in...');

        setTimeout(() => {
          if (result.user?.roleName === 'ADMIN') {
            router.push('/admin');
          } else if (result.user?.roleName === 'STUDENT') {
            router.push('/student');
          } else {
            router.push('/');
          }
        }, 800);
      } else {
        setErrorMsg(result.error || (locale === 'so' ? 'Xogta aad gelisay ma saxna.' : 'Invalid credentials. Please try again.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotIdentifier('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f3] flex flex-col justify-between text-gray-900 font-sans antialiased">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1f4127] flex items-center justify-center font-bold text-white shadow-sm">
            🌾
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-emerald-950 block leading-tight">BAKKA SYSTEM</span>
            <span className="text-[10px] text-emerald-700">Operations & Management</span>
          </div>
        </Link>
        <LanguageToggle />
      </header>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {locale === 'so' ? 'Ku Soo Dhawoow' : 'Sign In to Your Account'}
            </h1>
            <p className="text-xs text-gray-500">
              {locale === 'so'
                ? 'Geli email-kaaga/username-ka iyo furaha sirta ah'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email or Username */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">
                {locale === 'so' ? 'Email ama Username' : 'Email or Username'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={locale === 'so' ? 'e.g. admin@bakkafarm.com ama cali_nuur' : 'e.g. user@domain.com or username'}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-gray-700 font-semibold">
                  {locale === 'so' ? 'Furaha Sirta ah (Password)' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  {locale === 'so' ? 'Ma ilowday furaha?' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-600 font-medium">
                  {locale === 'so' ? 'I xasuuso (Remember me)' : 'Remember me for 30 days'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1f4127] hover:bg-[#16301d] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{locale === 'so' ? 'Fadlan sug...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{locale === 'so' ? 'Soo Gal Nidaamka' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Redirect Link */}
          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
            <div>
              <span>
                {locale === 'so' ? 'Weli ma lihid akoon?' : "Don't have an account yet?"}{' '}
              </span>
              <Link
                href="/signup"
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>{locale === 'so' ? 'Isku qor halkan' : 'Sign Up (Register)'}</span>
              </Link>
            </div>
            <div className="pt-2 border-t border-dashed border-gray-200">
              <Link
                href="/admin/login"
                className="text-[11px] text-gray-400 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{locale === 'so' ? 'Albaabka Maamulka Sare (Admin Portal) →' : 'Administrator Security Portal →'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-900">
                {locale === 'so' ? 'Soo Celinta Furaha' : 'Reset Your Password'}
              </h2>
              <p className="text-xs text-gray-500">
                {locale === 'so'
                  ? 'Geli email-kaaga ama username-ka si laguu soo diro tilmaamo'
                  : 'Enter your email or username to request a reset link'}
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs space-y-1">
                <p className="font-bold">✓ Reset Request Received</p>
                <p className="text-[11px]">If an account is associated with that identity, instructions have been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email / Username</label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <footer className="py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>Bakka Farm & Training Center Operations Platform • Secured with Argon2id & JWT</span>
      </footer>
    </div>
  );
}
