'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const { user, logout, switchRole, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('ADMIN');

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
    { href: '/fields', label: t.navFields, icon: MapPin },
    { href: '/seasons', label: t.navSeasons, icon: Calendar },
    { href: '/crops', label: t.navCrops, icon: Sprout },
    { href: '/tasks', label: t.navTasks, icon: CheckSquare },
    { href: '/irrigation', label: t.navIrrigation, icon: Droplets },
    { href: '/inventory', label: t.navInventory, icon: Package },
    { href: '/harvest', label: t.navHarvest, icon: Boxes },
    { href: '/sales', label: t.navSales, icon: ShoppingBag },
    { href: '/expenses', label: t.navExpenses, icon: CreditCard },
    { href: '/reports', label: t.navReports, icon: BarChart3 },
    { href: '/student', label: locale === 'so' ? 'Barta Ardayga' : 'Student Portal', icon: GraduationCap },
    { href: '/staff', label: locale === 'so' ? 'Maamulka Users' : 'Users & Staff', icon: Users, adminOnly: true },
    { href: '/settings', label: t.navSettings, icon: Settings, adminOnly: true }
  ];

  const displayName = user?.fullName || userName || 'Bakka Farm System';
  const displayRole = user?.roleName || activeRole;

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
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            if (item.adminOnly && activeRole !== 'ADMIN') return null;

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
        <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-800 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{mobileMenuOpen ? 'Close' : 'Menu / Qaybaha'}</span>
            </button>
            <Link href="/" className="font-bold text-emerald-950 text-sm hidden sm:inline flex items-center gap-2">
              <span>🌾</span>
              <span>{t.appTitle}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <SyncStatusIndicator />

            {/* Quick Auth Status Indicator */}
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 text-xs font-medium transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{user?.username || 'Logout'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile / Narrow Screen Horizontal Module Navigation Bar */}
        <div className="md:hidden bg-[#1f4127] text-white px-3 py-2 border-b border-emerald-950 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            if (item.adminOnly && activeRole !== 'ADMIN') return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer Full Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1f4127] text-white p-4 space-y-3 border-b border-emerald-950 shadow-xl animate-fadeIn">
            <div className="p-3 bg-emerald-950/80 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-100">{displayName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-800 text-emerald-200 font-bold">
                  {displayRole}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-emerald-300 font-medium mb-1">Testing Role (RBAC):</label>
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
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                if (item.adminOnly && activeRole !== 'ADMIN') return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
                      active ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-300" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-emerald-800/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full p-2 text-xs text-red-300 hover:bg-red-900/40 rounded-lg font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
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
