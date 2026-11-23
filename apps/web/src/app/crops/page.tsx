'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { Sprout, Plus, CheckCircle2 } from 'lucide-react';

interface PlantingBatchRecord {
  id: string;
  batch_code: string;
  crop_name: string;
  variety_name: string;
  field_name: string;
  planting_date: string;
  planted_area: number;
  area_unit: string;
  status: string;
  expected_harvest_date: string;
}

const INITIAL_BATCHES: PlantingBatchRecord[] = [
  { id: 'b-1', batch_code: 'MZ-2026-A1', crop_name: 'Maize (Galley)', variety_name: 'Somali White Local', field_name: 'Wabiga Shabelle - Plot A', planting_date: '2026-10-12', planted_area: 2.5, area_unit: 'HA', status: 'GROWING', expected_harvest_date: '2026-12-28' },
  { id: 'b-2', batch_code: 'TM-2026-B1', crop_name: 'Tomatoes (Yaanyo)', variety_name: 'Rio Grande High-Yield', field_name: 'Ceel-Wadaag - Plot B', planting_date: '2026-10-18', planted_area: 1.5, area_unit: 'HA', status: 'READY_TO_HARVEST', expected_harvest_date: '2026-11-30' },
  { id: 'b-3', batch_code: 'PP-2026-A2', crop_name: 'Papaya (Babay)', variety_name: 'Solo Red Flesh', field_name: 'Wabiga Shabelle - Plot A', planting_date: '2026-09-01', planted_area: 1.0, area_unit: 'HA', status: 'GROWING', expected_harvest_date: '2027-02-15' },
  { id: 'b-4', batch_code: 'WN-2026-C1', crop_name: 'Watermelon (Qare)', variety_name: 'Sugar Baby', field_name: 'Banaanka Bari - Plot C', planting_date: '2026-10-25', planted_area: 2.0, area_unit: 'HA', status: 'PLANTED', expected_harvest_date: '2027-01-10' }
];

export default function CropsPage() {
  const { t } = useI18n();
  const [batches, setBatches] = useState<PlantingBatchRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [cropName, setCropName] = useState('Maize (Galley)');
  const [varietyName, setVarietyName] = useState('Somali Local');
  const [fieldName, setFieldName] = useState('Wabiga Shabelle - Plot A');
  const [batchCode, setBatchCode] = useState(`BT-${Date.now().toString().slice(-4)}`);
  const [plantedArea, setPlantedArea] = useState('1.5');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function load() {
      const local = await db.planting_batches.toArray();
      if (local && local.length > 0) {
        setBatches(local);
      } else {
        setBatches(INITIAL_BATCHES);
        for (const b of INITIAL_BATCHES) {
          await db.planting_batches.put(b);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: PlantingBatchRecord = {
      id: generateUUID(),
      batch_code: batchCode,
      crop_name: cropName,
      variety_name: varietyName,
      field_name: fieldName,
      planting_date: plantingDate,
      planted_area: parseFloat(plantedArea) || 1.0,
      area_unit: 'HA',
      status: 'PLANTED',
      expected_harvest_date: '2027-01-30'
    };

    await syncEngine.saveOfflineMutation('PlantingBatch', 'CREATE', newBatch);
    setBatches([newBatch, ...batches]);
    setShowModal(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navCrops}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Crop varieties, planting batches, and growth stages</p>
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
                <th className="p-3.5">Batch Code</th>
                <th className="p-3.5">Crop & Variety</th>
                <th className="p-3.5">Assigned Field</th>
                <th className="p-3.5">Planted Area</th>
                <th className="p-3.5">Planting Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5 font-mono font-bold text-gray-900">{b.batch_code}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-gray-900">{b.crop_name}</p>
                    <p className="text-[10px] text-gray-500">{b.variety_name}</p>
                  </td>
                  <td className="p-3.5">{b.field_name}</td>
                  <td className="p-3.5 font-semibold text-gray-800">{b.planted_area} {b.area_unit}</td>
                  <td className="p-3.5">{b.planting_date}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'READY_TO_HARVEST' ? 'bg-amber-100 text-amber-800' :
                      b.status === 'GROWING' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
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
              <h2 className="text-base font-bold text-gray-900">Record New Planting Batch</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Crop Type</label>
                  <input
                    required
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Variety Name</label>
                  <input
                    required
                    type="text"
                    value={varietyName}
                    onChange={(e) => setVarietyName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
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
                    <label className="block text-gray-700 font-medium mb-1">Batch Code</label>
                    <input
                      required
                      type="text"
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Planted Area (HA)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={plantedArea}
                      onChange={(e) => setPlantedArea(e.target.value)}
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
