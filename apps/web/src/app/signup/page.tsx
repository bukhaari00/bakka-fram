'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { useI18n } from '../../lib/i18n/I18nContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export default function SignUpPage() {
  const { register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { locale } = useI18n();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.roleName === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli magacaaga oo buuxa' : 'Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli email sax ah' : 'Please enter a valid email address');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg(locale === 'so' ? 'Username-ku waa inuu ugu yaraan ka koobnaadaa 3 xaraf' : 'Username must be at least 3 characters');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(locale === 'so' ? 'Fadlan geli lambarkaaga taleefanka' : 'Please enter your phone number');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(locale === 'so' ? 'Furaha sirta ah waa inuu ugu yaraan ka koobnaadaa 6 xaraf' : 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(locale === 'so' ? 'Labada fure sir ma isku mid aha' : 'Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword
      });

      if (result.success && result.user) {
        setSuccessMsg(
          locale === 'so'
            ? 'Hambalyo! Akoonkaaga ardayga waa la diiwaangeliyey. Waxaad u gudbaysaa bogga gelitaanka (Login)...'
            : 'Registration successful! Your student account is created. Redirecting to login...'
        );

        setTimeout(() => {
          router.push('/login');
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-[10px] text-emerald-700">Student & Operational Platform</span>
          </div>
        </Link>
        <LanguageToggle />
      </header>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200/80 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'so' ? 'Akoon Cusub (Arday)' : 'New Student Registration'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {locale === 'so' ? 'Sameyso Akoon' : 'Create an Account'}
            </h1>
            <p className="text-xs text-gray-500">
              {locale === 'so'
                ? 'Geli xogtaada si aad ugu biirto barnaamijyada iyo tababarrada Bakka'
                : 'Join Bakka Agricultural & Training Programs as a student'}
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
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">
                {locale === 'so' ? 'Magacaaga Oo Buuxa' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sahal Jaamac Axmed"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. sahal_j"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">
                {locale === 'so' ? 'Telefoonka Gacanta' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+252-61-XXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  {locale === 'so' ? 'Furaha Sirta ah' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  {locale === 'so' ? 'Hubi Furaha' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                {locale === 'so'
                  ? 'Akoonada cusub ee la diiwaangeliyo waxay si toos ah u helaan doorka Ardayga (Student).'
                  : 'New registrations default to the Student role with access to learning & training dashboards.'}
              </span>
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
                  <span>{locale === 'so' ? 'Fadlan sug...' : 'Registering Account...'}</span>
                </>
              ) : (
                <>
                  <span>{locale === 'so' ? 'Dhammeystir Diiwaangelinta' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
            <span>
              {locale === 'so' ? 'Horay ma u lahayd akoon?' : 'Already have an account?'}{' '}
            </span>
            <Link
              href="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {locale === 'so' ? 'Soo Gal Halkan (Sign In)' : 'Sign In Here'}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>Bakka Farm & Training Operations • Role-Based Access Control</span>
      </footer>
    </div>
  );
}
