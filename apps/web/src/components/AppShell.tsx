'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '../lib/i18n/I18nContext';
import { useAuth } from '../lib/auth/AuthContext';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { LanguageToggle } from './LanguageToggle';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Sprout,
  CheckSquare,
  Droplets,
  Package,
  Boxes,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  GraduationCap,
  LogIn,
  UserCheck
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
}

const ROLES_LIST = [
  { id: 'ADMIN', label: 'Bakka Admin (Full Access)' },
  { id: 'STAFF', label: 'Staff (Operations)' },
  { id: 'STUDENT', label: 'Student (Training & Tasks)' },
  { id: 'FARM_MANAGER', label: 'Farm Manager' },
  { id: 'FIELD_SUPERVISOR', label: 'Field Supervisor' },
  { id: 'FARM_WORKER', label: 'Farm Worker' },
  { id: 'STOREKEEPER', label: 'Storekeeper' },
  { id: 'ACCOUNTANT', label: 'Accountant' }
];

export function AppShell({ children, userRole, userName }: AppShellProps) {
  const { t, locale } = useI18n();
  const { user, logout, switchRole, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('ADMIN');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.roleName) {
      setActiveRole(user.roleName);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bakka_active_role');
      if (saved) {
        setActiveRole(saved);
      } else if (userRole) {
        setActiveRole(userRole);
      }
    }
  }, [user, userRole]);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    switchRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bakka_active_role', role);
    }
  };

  const navItems = [
    { href: '/', label: t.navDashboard, icon: LayoutDashboard },
    { href: '/student', label: locale === 'so' ? 'Barta Ardayga' : 'Student Portal', icon: GraduationCap, roles: ['STUDENT', 'ADMIN', 'STAFF', 'MANAGER'] },
    { href: '/crops', label: t.navCrops, icon: Sprout, roles: ['ADMIN', 'MANAGER', 'STAFF', 'STUDENT', 'CUSTOMER'] },
    { href: '/tasks', label: t.navTasks, icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'STAFF', 'STUDENT'] },
    { href: '/fields', label: t.navFields, icon: MapPin, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { href: '/seasons', label: t.navSeasons, icon: Calendar, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { href: '/irrigation', label: t.navIrrigation, icon: Droplets, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { href: '/inventory', label: t.navInventory, icon: Package, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { href: '/harvest', label: t.navHarvest, icon: Boxes, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
    { href: '/sales', label: t.navSales, icon: ShoppingBag, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'ACCOUNTANT'] },
    { href: '/expenses', label: t.navExpenses, icon: CreditCard, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
    { href: '/reports', label: t.navReports, icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'STAFF', 'ACCOUNTANT'] },
    { href: '/staff', label: locale === 'so' ? 'Maamulka Users' : 'Users & Staff', icon: Users, adminOnly: true, roles: ['ADMIN'] },
    { href: '/settings', label: t.navSettings, icon: Settings, adminOnly: true, roles: ['ADMIN'] }
  ];

  const isNavVisible = (item: typeof navItems[0]) => {
    if (activeRole === 'ADMIN') return true;
    if (item.adminOnly && activeRole !== 'ADMIN') return false;
    if (item.roles && !item.roles.includes(activeRole)) return false;
    return true;
  };

  const displayName = user?.fullName || userName || 'Bakka Farm System';
  const displayRole = user?.roleName || activeRole;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-emerald-900 font-semibold text-sm">
          {locale === 'so' ? 'Bakka Farm: Fadlan sug, nidaamka ayaa furmaya...' : 'Bakka Farm: Loading system...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-600 font-medium text-sm mb-3">
          {locale === 'so' ? 'Fadlan gal nidaamka si aad u aragto xogta beerta.' : 'Please sign in to access Bakka Farm.'}
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all"
        >
          {locale === 'so' ? 'Gal Hadda (Sign In)' : 'Sign In Now'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col md:flex-row text-gray-900 font-sans antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1f4127] text-white border-r border-emerald-950 flex-shrink-0">
        <Link href="/" className="p-4 border-b border-emerald-800 flex items-center gap-3 hover:bg-emerald-900/40 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
            🌾
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-emerald-50 leading-tight">BAKKA SYSTEM</h1>
            <p className="text-[11px] text-emerald-300">Operations & Management</p>
          </div>
        </Link>

        {/* User Context & Role Switcher */}
        <div className="px-4 py-3 bg-emerald-950/60 border-b border-emerald-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-100 truncate">{displayName}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 border border-emerald-700">
              {displayRole}
            </span>
          </div>
          {user?.roleName === 'ADMIN' && (
            <div className="pt-1">
              <label className="text-[10px] text-emerald-400 block mb-0.5 font-medium">Switch Role View (RBAC):</label>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-emerald-900/90 text-emerald-200 border border-emerald-700 rounded px-2 py-1 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                title="Switch role view for testing RBAC"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            if (!isNavVisible(item)) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-emerald-800 space-y-2">
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout} (Sign Out)</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to System</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-800 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm active:scale-95"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{mobileMenuOpen ? 'Close' : 'Qaybaha'}</span>
            </button>
            <Link href="/" className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <span className="text-base">🌾</span>
              <span className="hidden xs:inline font-extrabold tracking-tight">BAKKA FARM</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageToggle />
            <div className="hidden sm:inline-flex">
              <SyncStatusIndicator />
            </div>

            {/* Quick Auth Status Indicator */}
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 text-xs font-medium transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate max-w-[120px]">{user?.username || 'Logout'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#17321d] text-white p-4 space-y-3 border-b border-emerald-950 shadow-2xl z-20 animate-fadeIn">
            <div className="p-3 bg-emerald-950/90 rounded-xl border border-emerald-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-50 truncate max-w-[180px]">{displayName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-800 text-emerald-200 font-bold border border-emerald-700">
                  {displayRole}
                </span>
              </div>
              {user?.roleName === 'ADMIN' && (
                <div>
                  <label className="block text-[10px] text-emerald-400 font-medium mb-1">Switch Testing Role (RBAC):</label>
                  <select
                    value={activeRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-emerald-900 text-emerald-100 border border-emerald-700 rounded p-1.5 text-xs font-semibold"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                if (!isNavVisible(item)) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      active ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-emerald-100 bg-emerald-900/60 hover:bg-emerald-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between">
              <div className="sm:hidden">
                <SyncStatusIndicator />
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full p-2.5 text-xs text-red-200 bg-red-950/60 border border-red-800/60 hover:bg-red-900/60 rounded-lg font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Ka Bax (Sign Out)</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Container */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
