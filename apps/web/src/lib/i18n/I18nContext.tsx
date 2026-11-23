'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Locale } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (typeof translations)['en'];
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('bakka_farm_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'so')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('bakka_farm_locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { locale: 'en' as Locale, setLocale: () => {}, t: translations.en };
  }
  return ctx;
}
