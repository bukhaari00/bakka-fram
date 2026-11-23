'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { CreditCard, Plus } from 'lucide-react';

interface ExpenseRecord {
  id: string;
  category_name: string;
  amount: number;
  payment_method: string;
  vendor_name: string;
  description: string;
  expense_date: string;
}

const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', category_name: 'Fuel & Machinery', amount: 180.0, payment_method: 'CASH', vendor_name: 'Hass Petroleum Afgooye', description: 'Diesel fuel for tractor plowing Plot A & B', expense_date: '2026-11-22' },
  { id: 'exp-2', category_name: 'Labor & Field Wages', amount: 140.0, payment_method: 'MOBILE_MONEY', vendor_name: 'Field Crew Team 2', description: 'Daily labor wages for weeding', expense_date: '2026-11-21' },
  { id: 'exp-3', category_name: 'Packaging & Crates', amount: 95.0, payment_method: 'CASH', vendor_name: 'Muqdisho Packaging Depot', description: '50 wooden crates for tomato harvest', expense_date: '2026-11-19' }
];

export default function ExpensesPage() {
  const { t } = useI18n();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState('Fuel & Machinery');
  const [amount, setAmount] = useState('100.0');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function load() {
      const local = await db.expenses.toArray();
      if (local && local.length > 0) {
        setExpenses(local);
      } else {
        setExpenses(INITIAL_EXPENSES);
        for (const exp of INITIAL_EXPENSES) {
          await db.expenses.put(exp);
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: ExpenseRecord = {
      id: generateUUID(),
      category_name: category,
      amount: parseFloat(amount) || 0,
      payment_method: paymentMethod,
      vendor_name: vendor || 'Direct Vendor',
      description,
      expense_date: new Date().toISOString().slice(0, 10)
    };

    await syncEngine.saveOfflineMutation('Expense', 'CREATE', newExp);
    setExpenses([newExp, ...expenses]);
    setShowModal(false);
    setVendor('');
    setDescription('');
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navExpenses}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Operational farm expenditures, fuel, labor & supplies</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-medium">TOTAL EXPENDITURE</span>
              <span className="text-base font-bold text-gray-900">${totalSpent.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Vendor / Payee</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/80">
                  <td className="p-3.5 font-bold text-gray-900">{e.category_name}</td>
                  <td className="p-3.5 font-medium text-gray-800">{e.vendor_name}</td>
                  <td className="p-3.5 text-gray-500 max-w-xs truncate">{e.description}</td>
                  <td className="p-3.5">{e.expense_date}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                      {e.payment_method}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-gray-900 text-right">${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Record Farm Expense</h2>
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Labor & Field Wages">Labor & Field Wages</option>
                    <option value="Fuel & Machinery">Fuel & Machinery</option>
                    <option value="Seeds & Seedlings">Seeds & Seedlings</option>
                    <option value="Fertilizers & Nutrients">Fertilizers & Nutrients</option>
                    <option value="Irrigation & Water Power">Irrigation & Water Power</option>
                    <option value="Packaging & Crates">Packaging & Crates</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Amount ($)</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="CASH">Cash in Safe</option>
                      <option value="MOBILE_MONEY">Hormuud EVC Plus</option>
                      <option value="BANK_TRANSFER">Premier Bank</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Vendor / Payee</label>
                  <input
                    required
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Hass Fuel Station"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
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
