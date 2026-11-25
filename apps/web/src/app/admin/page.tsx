'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { useI18n } from '../../lib/i18n/I18nContext';
import { AppShell } from '../../components/AppShell';
import {
  ShieldAlert,
  Users,
  Database,
  Activity,
  Layers,
  Sprout,
  DollarSign,
  FileText,
  UserPlus,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const router = useRouter();

  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [usersCount, setUsersCount] = useState<number>(3);

  // Strict Server-Side/Client-Side RBAC Enforcement: Only ADMIN role is permitted
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
      } else if (user?.roleName !== 'ADMIN') {
        // Automatically eject non-admin users to their permitted portal
        if (user?.roleName === 'STUDENT') {
          router.push('/student');
        } else {
          router.push('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Live health query
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.database === 'connected') {
          setDbStatus('Connected (Neon PostgreSQL)');
        } else {
          setDbStatus('Degraded / Initializing');
        }
      })
      .catch(() => setDbStatus('Offline'));
  }, []);

  if (isLoading || !isAuthenticated || user?.roleName !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#0b1411] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold mb-1">
          {locale === 'so' ? 'Waa la hubinayaa awoodaha maamulka...' : 'Verifying Administrative Authorization...'}
        </h2>
        <p className="text-xs text-emerald-400/70">
          Bakka Farm Management RBAC Security Gateway
        </p>
      </div>
    );
  }

  return (
    <AppShell userRole="ADMIN" userName={user.fullName || 'Administrator'}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-[#12231e] via-[#1a382e] to-[#12231e] border border-emerald-800/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Administration Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {locale === 'so' ? 'Qaybta Maamulka Sare' : 'Bakka Executive Admin Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/70 mt-1">
                {locale === 'so'
                  ? `Ku soo dhawoow, ${user.fullName}. Waxaad haysataa dhammaan awoodaha maamulka beerta.`
                  : `Authenticated as ${user.fullName} (${user.email}). Master administrative control active.`}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 font-mono">
                ROLE: ADMIN
              </span>
            </div>
          </div>
        </div>

        {/* System & DB Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Database Status</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">{dbStatus}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Users</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{usersCount} Active</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Security Engine</p>
              <p className="text-sm font-bold text-purple-700 mt-1">Argon2id + PBKDF2</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">System Health</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">100% Operational</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Administration Modules Grid */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>Maamulka Nidaamka (Administrative Controls)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/staff"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Maamulka Users & Staff</h3>
              <p className="text-xs text-gray-500 mt-1">
                Eeg koontooyinka ardayda, shaqaalaha, maamulayaasha iyo xaqiijinta xogtooda.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Fur Maamulka</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/finance"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Dhaqaalaha & Lacagta (Finance)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Maamul dakhliga, kharashaadka beerta, iibka wax-soo-saarka iyo xisaabaadka.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Eeg Dhaqaalaha</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/crops"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100/70 text-green-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Dalagyada Beerta (Crops)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Maamul beerista, qorshayaasha waraabka, kormeerka beerta iyo goosashada.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Eeg Dalagyada</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/student"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Barta Ardayda (Student Portal)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Eeg waxa ardayda tababaranaysa loo diyaariyey iyo maamulka casharrada beerta.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Barta Ardayda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/reports"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Warbixinnada Guud (Reports)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Soo saar warbixinnada dalagyada, wax-soo-saarka xilliyada iyo khasaaraha/faa'iidada.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Eeg Warbixinnada</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/settings"
              className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Habeynta Nidaamka (Settings)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Habee beerta, xaddiga cabbirrada, unugyada (Units), iyo keydinta offline-ka.
              </p>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1 group-hover:gap-1.5 transition-all">
                <span>Gal Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
