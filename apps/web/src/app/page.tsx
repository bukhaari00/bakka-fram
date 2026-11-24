'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useI18n } from '../lib/i18n/I18nContext';
import { useAuth } from '../lib/auth/AuthContext';
import {
  Calendar,
  MapPin,
  Sprout,
  CheckSquare,
  AlertTriangle,
  Boxes,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Package,
  Droplets,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const activeRole = user?.roleName || 'STUDENT';

  const [metrics] = useState({
    activeSeason: 'Deyr Season 2026',
    fieldsCount: 4,
    activePlantingsCount: 4,
    tasksTodayCount: 4,
    overdueTasksCount: 1,
    lowStockItemsCount: 2,
    totalSalesInvoiced: 14500.0,
    totalSalesCollected: 11800.0,
    outstandingCustomerDebt: 2700.0,
    totalExpenses: 5200.0,
    totalCashBalance: 12450.0,
    syncConflictsCount: 0
  });

  const allModules = [
    {
      href: '/student',
      title: locale === 'so' ? 'Barta Ardayga' : 'Student Portal',
      titleSo: 'Barta Ardayga & Tababarka',
      desc: 'Duruusta beerta, farsamada waraabka & tababarka',
      descEn: 'Student courses, drip irrigation lessons & field training',
      icon: GraduationCap,
      badge: 'Courses & Tasks',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      roles: ['STUDENT', 'ADMIN', 'STAFF', 'MANAGER']
    },
    {
      href: '/crops',
      title: t.navCrops,
      titleSo: 'Dalagyada & Beeritaanka (Crops)',
      desc: 'Galley, Yaanyo, Babay, Qare & taariikhda goynta',
      descEn: 'Maize, Tomatoes, Papaya, Watermelon planting batches',
      icon: Sprout,
      badge: '4 Batches',
      color: 'bg-green-50 text-green-700 border-green-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF', 'STUDENT', 'CUSTOMER']
    },
    {
      href: '/tasks',
      title: t.navTasks,
      titleSo: 'Hawlaha Beerta (Tasks)',
      desc: 'Falid, kormeer, bacrimin, goyn & xisaabinta saacadaha',
      descEn: 'Weeding, fertilizing, scouting & worker labor tracking',
      icon: CheckSquare,
      badge: '4 Tasks Today',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF', 'STUDENT']
    },
    {
      href: '/fields',
      title: t.navFields,
      titleSo: 'Beeraha & Qaybaha (Fields)',
      desc: 'Beero 4 firfircoon, noocyada ciidda iyo kanaallada waraabka',
      descEn: '4 active plots, soil types, area size and irrigation sources',
      icon: MapPin,
      badge: '4 Plots',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    {
      href: '/seasons',
      title: t.navSeasons,
      titleSo: 'Xilliyada Beeraha (Seasons)',
      desc: 'Deyr Season 2026, Gu & jadwalada qorshaha beerista',
      descEn: 'Deyr 2026 active, Gu, Jiilaal operational timelines',
      icon: Calendar,
      badge: 'Deyr Active',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    {
      href: '/irrigation',
      title: t.navIrrigation,
      titleSo: 'Dhacdooyinka Waraabka (Irrigation)',
      desc: 'Kanaalka Wabiga Shabelle, ceelka cadceedda & dhibicda',
      descEn: 'River canal, solar borehole pumps, volume & fuel costs',
      icon: Droplets,
      badge: '3 Events Logged',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    {
      href: '/inventory',
      title: t.navInventory,
      titleSo: 'Bakhaarka & Qalabka (Inventory)',
      desc: 'Abuur, bacriminta NPK/Urea, shidaalka & sanduuqyada',
      descEn: 'Seeds, NPK, Urea, fuel, crates & immutable stock ledger',
      icon: Package,
      badge: '2 Low Stock',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    {
      href: '/harvest',
      title: t.navHarvest,
      titleSo: 'Soo-Saarka & Goynta (Harvest)',
      desc: 'Goyn qayb-qayb ah, tayo-sooc & keydinta bakhaarka',
      descEn: 'Batch yields, Grade A produce lots & storage tracking',
      icon: Boxes,
      badge: '2,470 KG Logged',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']
    },
    {
      href: '/sales',
      title: t.navSales,
      titleSo: 'Iibka & Dalabyada (Sales)',
      desc: 'Qaansheegyo, macaamiisha suuqa & dalabyada',
      descEn: 'Produce invoicing, market clients & customer orders',
      icon: ShoppingBag,
      badge: 'Sales & Orders',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      roles: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'ACCOUNTANT']
    },
    {
      href: '/expenses',
      title: t.navExpenses,
      titleSo: 'Kharashaadka & Lacagta (Expenses)',
      desc: 'Mushahaarka shaqaalaha, shidaalka cagafta & iibsiga',
      descEn: 'Field wages, diesel fuel, maintenance & cashbook ledger',
      icon: CreditCard,
      badge: 'Expenses',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT']
    },
    {
      href: '/reports',
      title: t.navReports,
      titleSo: 'Warbixinada & Soosaarka (Reports)',
      desc: 'Faa’iidada beerta, celceliska goynta & dhoofinta CSV',
      descEn: 'Yield rates, financial margin analytics & printable exports',
      icon: BarChart3,
      badge: 'CSV / Print',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      roles: ['ADMIN', 'MANAGER', 'STAFF', 'ACCOUNTANT']
    },
    {
      href: '/staff',
      title: t.navStaff,
      titleSo: 'Maamulka Shaqaalaha (Users & Staff)',
      desc: 'Akoonada shaqada, doorarka (Roles) & kormeerka',
      descEn: 'Staff accounts, role permissions & user administration',
      icon: Users,
      badge: 'Users & Roles',
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      roles: ['ADMIN']
    },
    {
      href: '/settings',
      title: t.navSettings,
      titleSo: 'Habaynta Guud (Farm Settings)',
      desc: 'Xogta beerta, Afgooye Valley, lacagta & halbeegyada',
      descEn: 'Farm profile, location, currency & measurement units',
      icon: Settings,
      badge: 'Configured',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      roles: ['ADMIN']
    }
  ];

  // RBAC Filter: Only show modules the current user is authorized to view
  const visibleModules = allModules.filter(
    (m) => activeRole === 'ADMIN' || !m.roles || m.roles.includes(activeRole)
  );

  // Financial data is strictly restricted to ADMIN, MANAGER, and ACCOUNTANT
  const canViewFinancials = activeRole === 'ADMIN' || activeRole === 'MANAGER' || activeRole === 'ACCOUNTANT';

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Banner - Responsive & Mobile-Optimized */}
        <div className="bg-gradient-to-r from-[#296337] to-[#1f4127] text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              {locale === 'so' ? 'Halka Hawlgalka Beerta Bakka' : 'Bakka Farm Operations Dashboard'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              Afgooye River Valley • {user?.fullName || 'Bakka Farm Platform'} ({activeRole})
            </p>
          </div>
          <Link
            href="/seasons"
            className="inline-flex items-center gap-1.5 bg-emerald-800/90 hover:bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-600/60 text-xs font-semibold transition-colors self-start sm:self-auto shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t.activeSeason}: <strong>{metrics.activeSeason}</strong></span>
          </Link>
        </div>

        {/* Operational Overview Cards (2 Columns on Mobile, 4 on Desktop) */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            {locale === 'so' ? 'Dulmar Hawleed (Toos U Guur)' : 'Operational KPIs (Quick Navigation)'}
          </h2>

          {activeRole === 'STUDENT' ? (
            /* Student-Specific KPI Cards */
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Link
                href="/student"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Duruusta</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">4 Koorso</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Barta Ardayga →</span>
                </div>
              </Link>

              <Link
                href="/tasks"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Hawlahaaga</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">2 Hawl</p>
                  <span className="text-[10px] text-blue-700 font-semibold">Eeg Hawlaha →</span>
                </div>
              </Link>

              <Link
                href="/crops"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Dalagyada</span>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">4 Dalag</p>
                  <span className="text-[10px] text-green-700 font-semibold">Eeg Dalagyada →</span>
                </div>
              </Link>

              <Link
                href="/student"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Heerkaaga</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">75%</p>
                  <span className="text-[10px] text-purple-700 font-semibold">Horumarka Tababarka →</span>
                </div>
              </Link>
            </div>
          ) : activeRole === 'CUSTOMER' ? (
            /* Customer-Specific KPI Cards */
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Link
                href="/harvest"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Dalagga Diyaarka ah</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">2,470 KG</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Eeg Dalagga →</span>
                </div>
              </Link>

              <Link
                href="/crops"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Liiska Dalagyada</span>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">4 Nooc</p>
                  <span className="text-[10px] text-green-700 font-semibold">Tayo Sare →</span>
                </div>
              </Link>

              <Link
                href="/sales"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">Dalabyadaada</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">Dalabyo</p>
                  <span className="text-[10px] text-blue-700 font-semibold">Eeg Dalabyada →</span>
                </div>
              </Link>
            </div>
          ) : (
            /* Staff, Manager & Admin Operational KPI Cards */
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Link
                href="/fields"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">{t.activeFields}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.fieldsCount}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Plots A-D Active →</span>
                </div>
              </Link>

              <Link
                href="/crops"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">{t.growingBatches}</span>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.activePlantingsCount}</p>
                  <span className="text-[10px] text-green-700 font-semibold">4 Batches Active →</span>
                </div>
              </Link>

              <Link
                href="/tasks"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">{t.tasksDueToday}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.tasksTodayCount}</p>
                  <span className="text-[10px] text-blue-700 font-semibold">Eeg Hawlaha →</span>
                </div>
              </Link>

              <Link
                href="/inventory"
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-500">{t.lowStockAlerts}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.lowStockItemsCount}</p>
                  <span className="text-[10px] text-amber-700 font-semibold">Check Inventory →</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* All Farm Operations Modules Grid - Filtered by RBAC & Mobile-Responsive (2 Columns on Phone) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide uppercase">
                {locale === 'so' ? 'Qaybaha laguu oggol yahay' : 'Accessible Farm Modules'}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500">
                {locale === 'so'
                  ? 'Guji qayb kasta si toos ah si aad ugu shaqeyso'
                  : 'Click any module card below to open and manage that section'}
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {visibleModules.length} Modules
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {visibleModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.99]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border ${m.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors truncate max-w-[80px]">
                        {m.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {locale === 'so' ? m.titleSo : m.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 hidden xs:block">
                        {locale === 'so' ? m.desc : m.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                    <span>{locale === 'so' ? 'Fur' : 'Open'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Aggregates Grid - Strictly Restricted to Admin / Manager / Accountant */}
        {canViewFinancials && (
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 tracking-wide uppercase">
                  {locale === 'so' ? 'Xisaabaadka & Ganacsiga' : 'Financial & Commerce Overview'}
                </h2>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {locale === 'so' ? 'Ilaashan (Admin/Manager)' : 'Restricted (Admin Only)'}
                </span>
              </div>
              <Link href="/sales" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                <span>View Sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Link href="/sales" className="p-2.5 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <p className="text-[11px] text-gray-500 font-medium truncate">{t.totalSalesInvoiced}</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">${metrics.totalSalesInvoiced.toLocaleString()}</p>
                <span className="text-[9px] text-gray-500">Invoiced →</span>
              </Link>
              <Link href="/sales" className="p-2.5 sm:p-3 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-lg border border-emerald-200 transition-colors">
                <p className="text-[11px] text-emerald-800 font-medium truncate">{t.totalCashCollected}</p>
                <p className="text-base sm:text-xl font-bold text-emerald-900 mt-0.5">${metrics.totalSalesCollected.toLocaleString()}</p>
                <span className="text-[9px] text-emerald-700">Collected →</span>
              </Link>
              <Link href="/sales" className="p-2.5 sm:p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-lg border border-amber-200 transition-colors">
                <p className="text-[11px] text-amber-800 font-medium truncate">{t.customerDebts}</p>
                <p className="text-base sm:text-xl font-bold text-amber-900 mt-0.5">${metrics.outstandingCustomerDebt.toLocaleString()}</p>
                <span className="text-[9px] text-amber-700">Debts →</span>
              </Link>
              <Link href="/expenses" className="p-2.5 sm:p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-lg border border-blue-200 transition-colors">
                <p className="text-[11px] text-blue-800 font-medium truncate">{t.cashInHand}</p>
                <p className="text-base sm:text-xl font-bold text-blue-900 mt-0.5">${metrics.totalCashBalance.toLocaleString()}</p>
                <span className="text-[9px] text-blue-700">Cashbook →</span>
              </Link>
            </div>
          </div>
        )}

        {/* Offline & Data Safety Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-0.5">
            <p className="font-semibold">Bakka Farm System • RBAC & Security Active</p>
            <p className="text-[11px] sm:text-xs text-emerald-800">{t.offlineNotice}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
