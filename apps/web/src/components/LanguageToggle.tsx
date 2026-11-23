'use client';

import React from 'react';
import { useI18n } from '../lib/i18n/I18nContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-0.5 shadow-sm text-xs font-medium">
      <Globe className="w-3.5 h-3.5 text-gray-500 ml-1.5" />
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-0.5 rounded-md transition-colors ${
          locale === 'en'
            ? 'bg-emerald-700 text-white font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLocale('so')}
        className={`px-2 py-0.5 rounded-md transition-colors ${
          locale === 'so'
            ? 'bg-emerald-700 text-white font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Af-Soomaali
      </button>
    </div>
  );
}
