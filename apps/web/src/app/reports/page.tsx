'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { BarChart3, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  const { t } = useI18n();

  const productionSummary = [
    { crop: 'Maize (Galley)', field: 'Wabiga Shabelle - Plot A', season: 'Deyr Season 2026', plantedArea: '2.5 HA', harvestedQty: '1,200 KG', yieldRate: '480 KG/HA', status: 'ACTIVE' },
    { crop: 'Tomatoes (Yaanyo)', field: 'Ceel-Wadaag - Plot B', season: 'Deyr Season 2026', plantedArea: '1.5 HA', harvestedQty: '850 KG', yieldRate: '566 KG/HA', status: 'HARVESTING' },
    { crop: 'Papaya (Babay)', field: 'Wabiga Shabelle - Plot A', season: 'Deyr Season 2026', plantedArea: '1.0 HA', harvestedQty: '420 KG', yieldRate: '420 KG/HA', status: 'ACTIVE' }
  ];

  const handleExportCsv = () => {
    let csv = 'Crop,Field,Season,Planted Area,Harvested Qty,Yield Rate,Status\n';
    for (const r of productionSummary) {
      csv += `"${r.crop}","${r.field}","${r.season}","${r.plantedArea}","${r.harvestedQty}","${r.yieldRate}","${r.status}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakka_farm_production_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navReports}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Crop yields, harvest performance, sales margins & cash flows</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-sm"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportCsv}</span>
            </button>
          </div>
        </div>

        {/* Financial Margins Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Season Gross Margin Summary (Actuals vs Invoiced)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-medium">Invoiced Revenue</span>
              <p className="text-2xl font-bold text-emerald-950 mt-1">$14,500.00</p>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">$11,800.00 actual cash collected</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs text-rose-800 font-medium">Operating Expenses</span>
              <p className="text-2xl font-bold text-rose-950 mt-1">$5,200.00</p>
              <span className="text-[10px] text-rose-700 mt-0.5 block">Fuel, labor wages, inputs</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs text-blue-800 font-medium">Net Operating Cash Flow</span>
              <p className="text-2xl font-bold text-blue-950 mt-1">+$6,600.00</p>
              <span className="text-[10px] text-blue-700 mt-0.5 block">Excludes outstanding debts</span>
            </div>
          </div>
        </div>

        {/* Production Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Crop Production by Field & Season</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Crop</th>
                <th className="p-3.5">Field / Plot</th>
                <th className="p-3.5">Season</th>
                <th className="p-3.5">Planted Area</th>
                <th className="p-3.5">Total Harvested</th>
                <th className="p-3.5">Yield Performance</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productionSummary.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80">
                  <td className="p-3.5 font-bold text-gray-900">{p.crop}</td>
                  <td className="p-3.5">{p.field}</td>
                  <td className="p-3.5 font-medium">{p.season}</td>
                  <td className="p-3.5">{p.plantedArea}</td>
                  <td className="p-3.5 font-bold text-emerald-800">{p.harvestedQty}</td>
                  <td className="p-3.5 font-semibold text-gray-800">{p.yieldRate}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
