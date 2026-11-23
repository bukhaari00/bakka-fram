'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { ShoppingBag, Plus, CreditCard } from 'lucide-react';

interface SaleRecord {
  id: string;
  invoice_number: string;
  customer_name: string;
  sale_date: string;
  produce_description: string;
  quantity: number;
  unit: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'PAID' | 'PARTIAL' | 'PENDING';
}

const INITIAL_SALES: SaleRecord[] = [
  { id: 's-1', invoice_number: 'INV-2026-0041', customer_name: 'Suuqa Bakaaraha Wholesaler', sale_date: '2026-11-21', produce_description: 'Sweet Corn - Grade A', quantity: 800, unit: 'KG', total_amount: 1200.0, paid_amount: 1200.0, payment_status: 'PAID' },
  { id: 's-2', invoice_number: 'INV-2026-0042', customer_name: 'Hodan Fresh Produce Market', sale_date: '2026-11-22', produce_description: 'Tomatoes Grade A', quantity: 500, unit: 'KG', total_amount: 650.0, paid_amount: 350.0, payment_status: 'PARTIAL' },
  { id: 's-3', invoice_number: 'DEV-OFFLINE-0007', customer_name: 'Afgooye Local Market Co-op', sale_date: '2026-11-23', produce_description: 'Papaya Crates', quantity: 200, unit: 'KG', total_amount: 400.0, paid_amount: 0.0, payment_status: 'PENDING' }
];

export default function SalesPage() {
  const { t } = useI18n();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('Fresh Tomatoes');
  const [qty, setQty] = useState('100');
  const [price, setPrice] = useState('1.5');
  const [initialPayment, setInitialPayment] = useState('150');

  useEffect(() => {
    async function load() {
      const local = await db.sales.toArray();
      if (local && local.length > 0) {
        setSales(local);
      } else {
        setSales(INITIAL_SALES);
        for (const s of INITIAL_SALES) {
          await db.sales.put(s);
        }
      }
    }
    load();
  }, []);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(qty) || 1;
    const p = parseFloat(price) || 1;
    const total = q * p;
    const paid = parseFloat(initialPayment) || 0;
    const status = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';

    const newSale: SaleRecord = {
      id: generateUUID(),
      invoice_number: `DEV-OFFLINE-${Date.now().toString().slice(-4)}`,
      customer_name: customerName,
      sale_date: new Date().toISOString().slice(0, 10),
      produce_description: description,
      quantity: q,
      unit: 'KG',
      total_amount: total,
      paid_amount: paid,
      payment_status: status
    };

    await syncEngine.saveOfflineMutation('Sale', 'CREATE', newSale);
    setSales([newSale, ...sales]);
    setShowModal(false);
    setCustomerName('');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navSales}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Produce sales invoices, customer credit & payments received</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sale Invoice</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Produce & Qty</th>
                <th className="p-3.5">Invoice Total</th>
                <th className="p-3.5">Paid Amount</th>
                <th className="p-3.5">Due Balance</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((s) => {
                const due = s.total_amount - s.paid_amount;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/80">
                    <td className="p-3.5 font-mono font-bold text-gray-900">{s.invoice_number}</td>
                    <td className="p-3.5 font-semibold text-gray-800">{s.customer_name}</td>
                    <td className="p-3.5">
                      <p>{s.produce_description}</p>
                      <span className="text-[10px] text-gray-400">{s.quantity} {s.unit}</span>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">${s.total_amount.toFixed(2)}</td>
                    <td className="p-3.5 font-semibold text-emerald-700">${s.paid_amount.toFixed(2)}</td>
                    <td className="p-3.5 font-semibold text-amber-700">${due > 0 ? due.toFixed(2) : '0.00'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        s.payment_status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.payment_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Record New Sale (Invoiced)</h2>
              <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Customer Name</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Suuqa Bakaaraha Store #12"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Produce Description</label>
                  <input
                    required
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Quantity (KG)</label>
                    <input
                      required
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Unit Price ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Initial Cash Received ($)</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(e.target.value)}
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
                    Create & Queue Invoice
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
