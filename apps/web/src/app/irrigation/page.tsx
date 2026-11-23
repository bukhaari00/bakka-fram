'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { Droplets, Plus } from 'lucide-react';

interface IrrigationRecord {
  id: string;
  field_name: string;
  water_source: string;
  irrigation_method: string;
  event_date: string;
  duration_minutes: number;
  water_volume_liters?: number;
  cost?: number;
  notes?: string;
}

const INITIAL_IRRIGATION: IrrigationRecord[] = [
  { id: 'ir-1', field_name: 'Wabiga Shabelle - Plot A', water_source: 'Shabelle River Canal', irrigation_method: 'Furrow Irrigation (Kanaal)', event_date: '2026-11-22', duration_minutes: 180, water_volume_liters: 12000, cost: 15.0 },
  { id: 'ir-2', field_name: 'Ceel-Wadaag - Plot B', water_source: 'Solar Borehole Well', irrigation_method: 'Drip Irrigation (Dhibic)', event_date: '2026-11-21', duration_minutes: 120, water_volume_liters: 4500, cost: 0.0 },
  { id: 'ir-3', field_name: 'Banaanka Bari - Plot C', water_source: 'Shabelle River Canal', irrigation_method: 'Sprinkler System', event_date: '2026-11-19', duration_minutes: 150, water_volume_liters: 8000, cost: 12.5 }
];

export default function IrrigationPage() {
  const { t } = useI18n();
  const [events, setEvents] = useState<IrrigationRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [fieldName, setFieldName] = useState('Wabiga Shabelle - Plot A');
  const [waterSource, setWaterSource] = useState('Shabelle River Canal');
  const [method, setMethod] = useState('Drip Irrigation');
  const [duration, setDuration] = useState('120');
  const [volume, setVolume] = useState('5000');
  const [cost, setCost] = useState('0');

  useEffect(() => {
    async function load() {
      const local = await db.irrigation_events.toArray();
      if (local && local.length > 0) {
        setEvents(local);
      } else {
        setEvents(INITIAL_IRRIGATION);
        for (const ir of INITIAL_IRRIGATION) {
          await db.irrigation_events.put(ir);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: IrrigationRecord = {
      id: generateUUID(),
      field_name: fieldName,
      water_source: waterSource,
      irrigation_method: method,
      event_date: new Date().toISOString().slice(0, 10),
      duration_minutes: parseInt(duration, 10) || 60,
      water_volume_liters: parseFloat(volume) || 0,
      cost: parseFloat(cost) || 0
    };

    await syncEngine.saveOfflineMutation('IrrigationEvent', 'CREATE', newEvent);
    setEvents([newEvent, ...events]);
    setShowModal(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navIrrigation}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Water sources, methods (Drip, Furrow, Sprinkler), duration & volume</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRecord}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Field / Plot</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Water Source</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Est. Volume</th>
                <th className="p-3.5">Power/Fuel Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>{e.field_name}</span>
                  </td>
                  <td className="p-3.5">{e.event_date}</td>
                  <td className="p-3.5">{e.water_source}</td>
                  <td className="p-3.5 font-medium text-gray-800">{e.irrigation_method}</td>
                  <td className="p-3.5">{e.duration_minutes} mins</td>
                  <td className="p-3.5 font-semibold text-gray-900">{e.water_volume_liters?.toLocaleString()} L</td>
                  <td className="p-3.5">${e.cost?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Log Irrigation Event</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Field / Plot</label>
                  <input
                    required
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Water Source</label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Shabelle River Canal">Shabelle River Canal</option>
                      <option value="Solar Borehole Well">Solar Borehole Well</option>
                      <option value="Water Storage Tank">Water Tank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Furrow Irrigation">Furrow (Kanaal)</option>
                      <option value="Sprinkler">Sprinkler</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Duration (Min)</label>
                    <input
                      required
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Volume (Liters)</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Cost ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border rounded-md text-gray-700"
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
