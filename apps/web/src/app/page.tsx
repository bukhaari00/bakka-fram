'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useI18n } from '../lib/i18n/I18nContext';
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
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { t, locale } = useI18n();
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

  const modules = [
    {
      href: '/fields',
      title: t.navFields,
      titleSo: 'Beeraha & Qaybaha (Fields)',
      desc: 'Beero 4 firfircoon, noocyada ciidda iyo kanaallada waraabka',
      descEn: '4 active plots, soil types, area size and irrigation sources',
      icon: MapPin,
      badge: '4 Plots',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      href: '/seasons',
      title: t.navSeasons,
      titleSo: 'Xilliyada Beeraha (Seasons)',
      desc: 'Deyr Season 2026, Gu & jadwalada qorshaha beerista',
      descEn: 'Deyr 2026 active, Gu, Jiilaal operational timelines',
      icon: Calendar,
      badge: 'Deyr Active',
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      href: '/crops',
      title: t.navCrops,
      titleSo: 'Dalagyada & Beeritaanka (Crops)',
      desc: 'Galley, Yaanyo, Babay, Qare & taariikhda goynta',
      descEn: 'Maize, Tomatoes, Papaya, Watermelon planting batches',
      icon: Sprout,
      badge: '4 Batches',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      href: '/tasks',
      title: t.navTasks,
      titleSo: 'Hawlaha Shaqaalaha (Tasks)',
      desc: 'Falid, kormeer, bacrimin, goyn & xisaabinta saacadaha',
      descEn: 'Weeding, fertilizing, scouting & worker labor tracking',
      icon: CheckSquare,
      badge: '4 Tasks Today',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      href: '/irrigation',
      title: t.navIrrigation,
      titleSo: 'Dhacdooyinka Waraabka (Irrigation)',
      desc: 'Kanaalka Wabiga Shabelle, ceelka cadceedda & dhibicda',
      descEn: 'River canal, solar borehole pumps, volume & fuel costs',
      icon: Droplets,
      badge: '3 Events Logged',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      href: '/inventory',
      title: t.navInventory,
      titleSo: 'Bakhaarka & Qalabka (Inventory)',
      desc: 'Abuur, bacriminta NPK/Urea, shidaalka & sanduuqyada',
      descEn: 'Seeds, NPK, Urea, fuel, crates & immutable stock ledger',
      icon: Package,
      badge: '2 Low Stock',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      href: '/harvest',
      title: t.navHarvest,
      titleSo: 'Soo-Saarka & Goynta (Harvest)',
      desc: 'Goyn qayb-qayb ah, tayo-sooc & keydinta bakhaarka',
      descEn: 'Batch yields, Grade A produce lots & storage tracking',
      icon: Boxes,
      badge: '2,470 KG Logged',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      href: '/sales',
      title: t.navSales,
      titleSo: 'Iibka & Lacag-Qabashada (Sales)',
      desc: 'Qaansheegyo, macaamiisha suuqa & daymaha harsan',
      descEn: 'Produce invoicing, Bakaaro market clients & customer debts',
      icon: ShoppingBag,
      badge: '$14,500 Invoiced',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300'
    },
    {
      href: '/expenses',
      title: t.navExpenses,
      titleSo: 'Kharashaadka & Lacagta (Expenses)',
      desc: 'Mushahaarka shaqaalaha, shidaalka cagafta & iibsiga',
      descEn: 'Field wages, diesel fuel, maintenance & cashbook ledger',
      icon: CreditCard,
      badge: '$5,200 Spent',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      href: '/reports',
      title: t.navReports,
      titleSo: 'Warbixinada & Soosaarka (Reports)',
      desc: 'Faa’iidada beerta, celceliska goynta & dhoofinta CSV',
      descEn: 'Yield rates, financial margin analytics & printable exports',
      icon: BarChart3,
      badge: 'CSV / Print',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      href: '/staff',
      title: t.navStaff,
      titleSo: 'Maamulka Shaqaalaha (Staff & RBAC)',
      desc: 'Akoonada shaqada, doorarka (Roles) & xaqiijinta offline-ka',
      descEn: 'Staff accounts, role permissions & device enrollment',
      icon: Users,
      badge: '6 Staff Enrolled',
      color: 'bg-slate-50 text-slate-700 border-slate-200'
    },
    {
      href: '/settings',
      title: t.navSettings,
      titleSo: 'Habaynta Guud (Farm Settings)',
      desc: 'Xogta beerta, Afgooye Valley, lacagta & halbeegyada',
      descEn: 'Farm profile, location, currency & measurement units',
      icon: Settings,
      badge: 'Configured',
      color: 'bg-gray-50 text-gray-700 border-gray-200'
    }
  ];

  return (
    <AppShell userRole="ADMIN" userName="Bakka Farm Administrator">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#296337] to-[#1f4127] text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Bakka Farm Operations Dashboard
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1">
              Afgooye River Valley • Active Operations & Produce Platform
            </p>
          </div>
          <Link
            href="/seasons"
            className="inline-flex items-center gap-2 bg-emerald-800/80 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg border border-emerald-600/50 text-xs font-medium transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span>{t.activeSeason}: <strong>{metrics.activeSeason}</strong></span>
          </Link>
        </div>

        {/* Operational Overview Cards (Clickable Links) */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            {locale === 'so' ? 'Dulmar Hawleed (Toos U Guur)' : 'Operational KPIs (Quick Navigation)'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Fields & Plots */}
            <Link
              href="/fields"
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-emerald-700">{t.activeFields}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.fieldsCount}</p>
                <span className="text-[11px] text-emerald-700 font-medium">Plots A - D Active →</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 2: Plantings */}
            <Link
              href="/crops"
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-green-700">{t.growingBatches}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.activePlantingsCount}</p>
                <span className="text-[11px] text-emerald-700 font-medium">Maize, Tomato, Papaya →</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 3: Tasks Today */}
            <Link
              href="/tasks"
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-blue-700">{t.tasksDueToday}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.tasksTodayCount}</p>
                <span className="text-[11px] text-amber-700 font-medium">{metrics.overdueTasksCount} overdue • View tasks →</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
            </Link>

            {/* Card 4: Low Stock Alert */}
            <Link
              href="/inventory"
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-rose-500 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-rose-700">{t.lowStockAlerts}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.lowStockItemsCount}</p>
                <span className="text-[11px] text-rose-700 font-medium">NPK & Urea • Check inventory →</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>

        {/* All Farm Operations Modules Grid (Direct Jump to Every Screen) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
                {locale === 'so' ? 'Dhammaan Qaybaha Nidaamka' : 'All Farm Operations Modules'}
              </h2>
              <p className="text-xs text-gray-500">
                {locale === 'so'
                  ? 'Guji qayb kasta si toos ah si aad ugu shaqeyso'
                  : 'Click any module card below to open and manage that section'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              12 Active Modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${m.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        {m.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {locale === 'so' ? m.titleSo : m.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {locale === 'so' ? m.desc : m.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                    <span>{locale === 'so' ? 'Fur Qaybta' : 'Open Module'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Aggregates Grid */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              {locale === 'so' ? 'Xisaabaadka & Ganacsiga' : 'Financial & Commerce Overview'}
            </h2>
            <Link href="/sales" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
              <span>View Sales Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/sales" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
              <p className="text-xs text-gray-500 font-medium">{t.totalSalesInvoiced}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">${metrics.totalSalesInvoiced.toLocaleString()}</p>
              <span className="text-[10px] text-gray-500">Invoices & Credit →</span>
            </Link>
            <Link href="/sales" className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-lg border border-emerald-200 transition-colors">
              <p className="text-xs text-emerald-800 font-medium">{t.totalCashCollected}</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">${metrics.totalSalesCollected.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-700">Cash Received →</span>
            </Link>
            <Link href="/sales" className="p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-lg border border-amber-200 transition-colors">
              <p className="text-xs text-amber-800 font-medium">{t.customerDebts}</p>
              <p className="text-xl font-bold text-amber-900 mt-1">${metrics.outstandingCustomerDebt.toLocaleString()}</p>
              <span className="text-[10px] text-amber-700">Receivables →</span>
            </Link>
            <Link href="/expenses" className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-lg border border-blue-200 transition-colors">
              <p className="text-xs text-blue-800 font-medium">{t.cashInHand}</p>
              <p className="text-xl font-bold text-blue-900 mt-1">${metrics.totalCashBalance.toLocaleString()}</p>
              <span className="text-[10px] text-blue-700">Cashbook & Expenses →</span>
            </Link>
          </div>
        </div>

        {/* Offline & Data Safety Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-1">
            <p className="font-semibold">Offline-First Operational Guarantee</p>
            <p>{t.offlineNotice}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
