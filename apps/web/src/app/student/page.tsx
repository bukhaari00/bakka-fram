'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { useI18n } from '../../lib/i18n/I18nContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Sprout,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Award
} from 'lucide-react';

export default function StudentPortalPage() {
  const { user, logout } = useAuth();
  const { locale } = useI18n();

  const [activeTab, setActiveTab] = useState<'modules' | 'tasks' | 'profile'>('modules');

  const studentModules = [
    {
      id: 'm-1',
      title: 'Modern Drip Irrigation Systems',
      titleSo: 'Farsamada Casriga ah ee Waraabka Dhibicda',
      progress: 85,
      instructor: 'Axmed Cabdulle (Agronomist)',
      sessions: '12 / 14 Completed',
      status: 'IN_PROGRESS'
    },
    {
      id: 'm-2',
      title: 'Soil Nutrient Health & Organic Composting',
      titleSo: 'Nafaqada Ciidda & Bacrinta Dabiiciga ah',
      progress: 60,
      instructor: 'Cali Nuur (Soil Specialist)',
      sessions: '6 / 10 Completed',
      status: 'IN_PROGRESS'
    },
    {
      id: 'm-3',
      title: 'Integrated Pest & Disease Management (IPM)',
      titleSo: 'Xakameynta Cayayaanka & Cudurrada Dalagga',
      progress: 100,
      instructor: 'Sahra Xaashi (Plant Pathologist)',
      sessions: '8 / 8 Completed',
      status: 'COMPLETED'
    }
  ];

  const studentTasks = [
    {
      id: 'st-1',
      title: 'Plot B Tomato Bed Moisture Inspection',
      field: 'Ceel-Wadaag - Plot B',
      dueDate: '2026-11-24',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: 'st-2',
      title: 'Shabelle Canal Water Flow Rate Recording',
      field: 'Wabiga Shabelle - Plot A',
      dueDate: '2026-11-25',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      id: 'st-3',
      title: 'Maize Spacing & Stand Count Exercise',
      field: 'Banaanka Bari - Plot C',
      dueDate: '2026-11-21',
      status: 'COMPLETED',
      priority: 'LOW'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f5] flex flex-col font-sans text-gray-900 antialiased">
      {/* Student Header */}
      <header className="bg-[#1f4127] text-white border-b border-emerald-950 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
              🌾
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide leading-tight">BAKKA TRAINING CENTER</h1>
              <p className="text-[11px] text-emerald-300">Student Portal • Ardayda</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-emerald-800">
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-100">{user?.fullName || 'Sahal Jaamac'}</p>
                <span className="text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700">
                  STUDENT
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#296337] to-[#1f4127] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 text-[11px] font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Deyr Academic Cohort 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {locale === 'so'
                ? `Ku soo dhawoow, ${user?.fullName || 'Arday'}!`
                : `Welcome back, ${user?.fullName || 'Student'}!`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200">
              {locale === 'so'
                ? 'Halkan waxaad ka maamuli kartaa casharradaada, hawlaha beerta, iyo natiijooyinkaaga.'
                : 'Track your practical agricultural training courses, field tasks, and attendance.'}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800/80 hover:bg-emerald-800 rounded-xl text-xs font-semibold text-emerald-100 border border-emerald-600/50 transition-colors"
            >
              <span>View Main Farm System</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'modules'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{locale === 'so' ? 'Qaybaha Tababarka (Modules)' : 'Training Modules'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{locale === 'so' ? 'Hawlaha Beerta (Field Tasks)' : 'Practical Tasks'}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{locale === 'so' ? 'Xogta Ardayga (Profile)' : 'My Profile'}</span>
          </button>
        </div>

        {/* Tab 1: Training Modules */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentModules.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{m.progress}%</span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {locale === 'so' ? m.titleSo : m.title}
                  </h3>
                  <p className="text-[11px] text-gray-500">Instructor: {m.instructor}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>{m.sessions}</span>
                    <span>Certificate Eligible</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Practical Field Tasks */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900">
                {locale === 'so' ? 'Hawlaha Beerta ee Laguu Qoondeeyey' : 'Assigned Practical Field Operations'}
              </h3>
              <span className="text-xs text-gray-500 font-medium">3 Total Tasks</span>
            </div>
            <div className="divide-y divide-gray-100">
              {studentTasks.map((st) => (
                <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-gray-900">{st.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {st.field}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        Due: {st.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {st.status}
                    </span>
                    <button className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
                      {st.status === 'COMPLETED' ? 'View Report' : 'Submit Progress'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl space-y-4">
            <h3 className="font-bold text-base text-gray-900">Student Profile Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Full Name:</span>
                <span className="font-bold text-gray-900">{user?.fullName || 'Sahal Jaamac'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Email Address:</span>
                <span className="font-semibold text-gray-900">{user?.email || 'sahal@example.com'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Username:</span>
                <span className="font-mono text-gray-900">@{user?.username || 'sahal_j'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Phone Number:</span>
                <span className="text-gray-900">{user?.phone || '+252-61-1234567'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">System Role:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {user?.roleName || 'STUDENT'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Security:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Password Protected & Argon2id Hash
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200 mt-auto">
        <span>Bakka Training Center & Farm Platform • Afgooye River Valley</span>
      </footer>
    </div>
  );
}
