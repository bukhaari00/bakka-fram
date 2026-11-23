'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { Boxes, Plus } from 'lucide-react';

interface HarvestEventRecord {
  id: string;
  crop_name: string;
  field_name: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  labor_cost: number;
  lot_number: string;
  destination: string;
}

const INITIAL_HARVESTS: HarvestEventRecord[] = [
  { id: 'h-1', crop_name: 'Tomatoes (Yaanyo)', field_name: 'Ceel-Wadaag - Plot B', harvest_date: '2026-11-20', quantity: 850, unit: 'KG', quality_grade: 'Grade A', labor_cost: 35.0, lot_number: 'LOT-TM-8821', destination: 'STORAGE' },
  { id: 'h-2', crop_name: 'Sweet Corn (Galley)', field_name: 'Wabiga Shabelle - Plot A', harvest_date: '2026-11-18', quantity: 1200, unit: 'KG', quality_grade: 'Grade A', labor_cost: 48.0, lot_number: 'LOT-MZ-4102', destination: 'DIRECT_SALE' },
  { id: 'h-3', crop_name: 'Solo Red Papaya', field_name: 'Wabiga Shabelle - Plot A', harvest_date: '2026-11-15', quantity: 420, unit: 'KG', quality_grade: 'Grade A', labor_cost: 20.0, lot_number: 'LOT-PP-1092', destination: 'STORAGE' }
];

export default function HarvestPage() {
  const { t } = useI18n();
  const [harvests, setHarvests] = useState<HarvestEventRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [cropName, setCropName] = useState('Tomatoes (Yaanyo)');
  const [fieldName, setFieldName] = useState('Ceel-Wadaag - Plot B');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState('KG');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [laborCost, setLaborCost] = useState('25.0');
  const [destination, setDestination] = useState('STORAGE');

  useEffect(() => {
    async function load() {
      const local = await db.harvest_records.toArray();
      if (local && local.length > 0) {
        setHarvests(local);
      } else {
        setHarvests(INITIAL_HARVESTS);
        for (const h of INITIAL_HARVESTS) {
          await db.harvest_records.put(h);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newHarvest: HarvestEventRecord = {
      id: generateUUID(),
      crop_name: cropName,
      field_name: fieldName,
      harvest_date: new Date().toISOString().slice(0, 10),
      quantity: parseFloat(quantity) || 100,
      unit,
      quality_grade: qualityGrade,
      labor_cost: parseFloat(laborCost) || 0,
      lot_number: `LOT-${Date.now().toString().slice(-4)}`,
      destination
    };

    await syncEngine.saveOfflineMutation('HarvestRecord', 'CREATE', newHarvest);
    setHarvests([newHarvest, ...harvests]);
    setShowModal(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navHarvest}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Multi-event partial harvests, quality grades & produce lot destinations</p>
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
                <th className="p-3.5">Produce & Lot</th>
                <th className="p-3.5">Field</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Harvested Qty</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Labor Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {harvests.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5">
                    <p className="font-bold text-gray-900">{h.crop_name}</p>
                    <span className="font-mono text-[10px] text-gray-400">{h.lot_number}</span>
                  </td>
                  <td className="p-3.5">{h.field_name}</td>
                  <td className="p-3.5">{h.harvest_date}</td>
                  <td className="p-3.5 font-bold text-emerald-800">{h.quantity.toLocaleString()} {h.unit}</td>
                  <td className="p-3.5">{h.quality_grade}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                      {h.destination}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-gray-900">${h.labor_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Record Harvest Event</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Crop</label>
                  <input
                    required
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Field Plot</label>
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
                    <label className="block text-gray-700 font-medium mb-1">Quantity & Unit</label>
                    <div className="flex gap-1">
                      <input
                        required
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-2/3 p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        required
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Quality Grade</label>
                    <select
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Grade A">Grade A (First Choice)</option>
                      <option value="Grade B">Grade B (Standard)</option>
                      <option value="Grade C">Grade C (Processing)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Destination</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="STORAGE">Storage / Store</option>
                      <option value="DIRECT_SALE">Direct Sale</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="HOUSEHOLD_USE">Household Use</option>
                      <option value="WASTE">Waste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Labor Cost ($)</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value)}
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
