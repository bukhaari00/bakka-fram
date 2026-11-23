'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { Calendar, Plus, CheckCircle2 } from 'lucide-react';

interface SeasonRecord {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  status: string;
}

const INITIAL_SEASONS: SeasonRecord[] = [
  { id: 's-1', name: 'Deyr Season 2026', start_date: '2026-10-01', end_date: '2026-12-31', status: 'ACTIVE' },
  { id: 's-2', name: 'Gu Season 2026', start_date: '2026-04-01', end_date: '2026-07-15', status: 'COMPLETED' },
  { id: 's-3', name: 'Jiilaal Irrigation 2026', start_date: '2026-01-10', end_date: '2026-03-25', status: 'COMPLETED' }
];

export default function SeasonsPage() {
  const { t } = useI18n();
  const [seasons, setSeasons] = useState<SeasonRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function load() {
      const local = await db.seasons.toArray();
      if (local && local.length > 0) {
        setSeasons(local);
      } else {
        setSeasons(INITIAL_SEASONS);
        for (const s of INITIAL_SEASONS) {
          await db.seasons.put(s);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSeason: SeasonRecord = {
      id: generateUUID(),
      name,
      start_date: startDate,
      end_date: endDate || undefined,
      status: 'ACTIVE'
    };

    await syncEngine.saveOfflineMutation('Season', 'CREATE', newSeason);
    setSeasons([newSeason, ...seasons]);
    setShowModal(false);
    setName('');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navSeasons}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Agricultural cropping periods, Gu & Deyr seasons</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRecord}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Season Name</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5">End Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {seasons.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{s.name}</span>
                  </td>
                  <td className="p-3.5">{s.start_date}</td>
                  <td className="p-3.5">{s.end_date || 'In Progress'}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Add New Agricultural Season</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Season Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gu Season 2027"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                    <input
                      required
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-md font-semibold hover:bg-emerald-800"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
