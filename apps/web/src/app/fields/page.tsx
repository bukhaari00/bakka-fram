'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { MapPin, Plus, Search, ShieldCheck } from 'lucide-react';

interface FieldRecord {
  id: string;
  name: string;
  code: string;
  total_area: number;
  area_unit: string;
  soil_type: string;
  water_source: string;
  status: string;
  notes?: string;
}

const INITIAL_FIELDS: FieldRecord[] = [
  { id: 'f-1', name: 'Wabiga Shabelle - Plot A', code: 'WSA-01', total_area: 4.5, area_unit: 'HA', soil_type: 'Clay Loam (Dhoobo)', water_source: 'Shabelle River Canal', status: 'ACTIVE' },
  { id: 'f-2', name: 'Ceel-Wadaag - Plot B', code: 'CWB-02', total_area: 3.0, area_unit: 'HA', soil_type: 'Sandy Loam (Carro Baad)', water_source: 'Solar Borehole Well', status: 'ACTIVE' },
  { id: 'f-3', name: 'Banaanka Bari - Plot C', code: 'BBC-03', total_area: 5.0, area_unit: 'HA', soil_type: 'Alluvial Loam', water_source: 'Shabelle River Canal', status: 'ACTIVE' },
  { id: 'f-4', name: 'Beerta Hoos - Plot D', code: 'BHD-04', total_area: 2.5, area_unit: 'HA', soil_type: 'Clay Loam', water_source: 'Water Storage Tank', status: 'RESTING' }
];

export default function FieldsPage() {
  const { t } = useI18n();
  const [fields, setFields] = useState<FieldRecord[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [totalArea, setTotalArea] = useState('2.0');
  const [areaUnit, setAreaUnit] = useState('HA');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [waterSource, setWaterSource] = useState('Shabelle River Canal');

  useEffect(() => {
    async function load() {
      const local = await db.fields.toArray();
      if (local && local.length > 0) {
        setFields(local);
      } else {
        setFields(INITIAL_FIELDS);
        for (const f of INITIAL_FIELDS) {
          await db.fields.put(f);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newField: FieldRecord = {
      id: generateUUID(),
      name,
      code,
      total_area: parseFloat(totalArea) || 1.0,
      area_unit: areaUnit,
      soil_type: soilType,
      water_source: waterSource,
      status: 'ACTIVE'
    };

    await syncEngine.saveOfflineMutation('Field', 'CREATE', newField);
    setFields([newField, ...fields]);
    setShowModal(false);
    setName('');
    setCode('');
  };

  const filtered = fields.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell userRole="ADMIN" userName="Bakka Farm Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navFields}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage agricultural plots, soils, and irrigation connections</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRecord}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-sm"
          />
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{f.name}</h3>
                  <span className="text-[11px] font-mono text-gray-500">{f.code}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  f.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {f.status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Area:</span>
                  <span className="font-semibold text-gray-800">{f.total_area} {f.area_unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Soil Type:</span>
                  <span>{f.soil_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Water Source:</span>
                  <span>{f.water_source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Add New Field / Plot</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Field Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Plot E - Webiga Bari"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Plot Code</label>
                    <input
                      required
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. PE-05"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Area & Unit</label>
                    <div className="flex gap-1">
                      <input
                        required
                        type="number"
                        step="0.1"
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        className="w-2/3 p-2 border border-gray-300 rounded-md"
                      />
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="HA">HA</option>
                        <option value="ACRE">Acre</option>
                        <option value="SQM">SQM</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Water Source</label>
                  <input
                    type="text"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
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
