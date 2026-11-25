'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useI18n } from '../../../lib/i18n/I18nContext';
import { LanguageToggle } from '../../../components/LanguageToggle';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Server
} from 'lucide-react';

export default function AdminLoginPage() {
  const { login, logout, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated as ADMIN, redirect to /admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.roleName === 'ADMIN') {
        router.push('/admin');
      } else {
        setErrorMsg('Fadlan gal koonto Maamule (Admin). Akoonkani waa ' + (user?.roleName || 'User'));
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli email-ka maamulka' : 'Please enter admin email or username');
      return;
    }

    if (!password) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli furaha sirta ah' : 'Please enter admin password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier.trim(), password, rememberMe);

      if (result.success && result.user) {
        // Enforce Server-Side Role Check for Admin Portal
        if (result.user.roleName !== 'ADMIN') {
          await logout();
          setErrorMsg(
            locale === 'so'
              ? 'Gelitaanka waa la diiday: Boggan waxaa loogu talagalay kaliya Maamulka Sare ee Bakka Farm.'
              : 'Access Denied: This portal is strictly restricted to Bakka Farm Administrators only.'
          );
          setIsLoading(false);
          return;
        }

        setSuccessMsg(
          locale === 'so'
            ? 'Guul! Waad soo gashay maamulka sare. Fadlan sug...'
            : 'Success! Administrator verified. Redirecting to Executive Dashboard...'
        );

        setTimeout(() => {
          router.push('/admin');
        }, 600);
      } else {
        setErrorMsg(
          result.error ||
            (locale === 'so'
              ? 'Xogta aad gelisay ma saxna ama koontadu ma leh awood maamule.'
              : 'Invalid administrator credentials. Access logged and denied.')
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during admin verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1411] flex flex-col justify-between text-gray-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-emerald-950/60 bg-[#0d1a16]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/40 border border-emerald-500/30">
            🌾
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-emerald-100 block leading-tight flex items-center gap-1.5">
              BAKKA FARM <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">ADMIN</span>
            </span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Executive Security Gateway</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-300/80 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Protected</span>
          </span>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Admin Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#12231e] rounded-3xl border border-emerald-800/40 shadow-2xl shadow-black/80 p-8 space-y-6 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner text-emerald-300">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {locale === 'so' ? 'Galitaanka Maamulka' : 'Administrator Sign In'}
            </h1>
            <p className="text-xs text-emerald-200/60 max-w-xs mx-auto">
              {locale === 'so'
                ? 'Albaabka amniga sare ee maamulayaasha Bakka Farm Management System.'
                : 'Secure administrative credentials required. Multi-role RBAC verified on Neon PostgreSQL.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl flex items-start gap-3 text-xs text-red-200 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-start gap-3 text-xs text-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-2">
                {locale === 'so' ? 'Email-ka Maamulka' : 'Admin Email / Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@bakkafarm.com"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a1512] border border-emerald-900/80 rounded-xl text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-2">
                {locale === 'so' ? 'Furaha Sirta ah' : 'Master Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#0a1512] border border-emerald-900/80 rounded-xl text-white placeholder-emerald-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-emerald-600 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400/80">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-emerald-800 text-emerald-600 focus:ring-emerald-500 bg-[#0a1512]"
                />
                <span>{locale === 'so' ? 'I xusuusnoow (30 maalmood)' : 'Remember session'}</span>
              </label>
              <Link href="/login" className="hover:text-emerald-300 transition-colors">
                {locale === 'so' ? 'Gelitaanka Ardayda →' : 'Student Sign In →'}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'so' ? 'Waa la hubinayaa...' : 'Verifying Admin Authority...'}</span>
                </>
              ) : (
                <>
                  <span>{locale === 'so' ? 'Gal Maamulka Sare' : 'Authenticate Administrator'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-emerald-400/50 border-t border-emerald-950/60">
        Bakka Farm Management Security Layer &copy; 2026 • Strict Role-Based Enforcement
      </footer>
    </div>
  );
}
