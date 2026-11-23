'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { Settings, Save, ShieldAlert, Database } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useI18n();
  const [farmName, setFarmName] = useState('Bakka Farm Operations');
  const [location, setLocation] = useState('Afgooye River Valley, Lower Shabelle');
  const [phone, setPhone] = useState('+252-61-5550199');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Africa/Mogadishu');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.navSettings}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Farm organization profile, currency, and data retention configurations</p>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
            Farm profile settings updated successfully!
          </div>
        )}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Farm Organization Details</h2>
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Farm Name</label>
              <input
                required
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Physical Location</label>
              <input
                required
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Contact Phone</label>
                <input
                  required
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Operating Currency</label>
                <input
                  required
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Timezone</label>
              <input
                required
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{t.save}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Database Backup & Data Safety</span>
          </h2>
          <p className="text-xs text-gray-600">
            Automated backups preserve all audit logs, stock ledger movements, and financial invoices.
          </p>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700">
            mysqldump -u bakka_user -p bakka_farm &gt; bakka_farm_daily_backup.sql
          </div>
        </div>
      </div>
    </AppShell>
  );
}
