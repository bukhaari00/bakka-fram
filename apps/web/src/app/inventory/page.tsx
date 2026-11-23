'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import { db } from '../../lib/db';
import { syncEngine } from '../../lib/sync/syncEngine';
import { generateUUID } from '../../lib/utils/uuid';
import { Package, Plus, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface InventoryItemRecord {
  id: string;
  name: string;
  code: string;
  category: string;
  default_unit: string;
  current_balance: number;
  reorder_level: number;
}

const INITIAL_ITEMS: InventoryItemRecord[] = [
  { id: 'inv-1', name: 'NPK 17-17-17 Fertilizer', code: 'NPK-50', category: 'FERTILIZER', default_unit: 'BAG_50KG', current_balance: 42, reorder_level: 10 },
  { id: 'inv-2', name: 'Urea 46% Nitrogen', code: 'UREA-50', category: 'FERTILIZER', default_unit: 'BAG_50KG', current_balance: 8, reorder_level: 15 },
  { id: 'inv-3', name: 'Rio Grande Tomato Seeds', code: 'SED-TM-01', category: 'SEED', default_unit: 'KG', current_balance: 14.5, reorder_level: 5 },
  { id: 'inv-4', name: 'Diesel Fuel for Tractors', code: 'FUL-DSL', category: 'FUEL', default_unit: 'L', current_balance: 320, reorder_level: 100 },
  { id: 'inv-5', name: 'Produce Wooden Crates', code: 'PKG-CRT', category: 'PACKAGING', default_unit: 'CRATE', current_balance: 180, reorder_level: 50 }
];

export default function InventoryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<InventoryItemRecord[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // New Item State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('FERTILIZER');
  const [unit, setUnit] = useState('BAG_50KG');
  const [reorderLevel, setReorderLevel] = useState('10');

  // Stock Receipt State
  const [selectedItemId, setSelectedItemId] = useState('');
  const [receiptQty, setReceiptQty] = useState('10');
  const [unitCost, setUnitCost] = useState('32.0');

  useEffect(() => {
    async function load() {
      const local = await db.inventory_items.toArray();
      if (local && local.length > 0) {
        setItems(local);
      } else {
        setItems(INITIAL_ITEMS);
        for (const it of INITIAL_ITEMS) {
          await db.inventory_items.put(it);
        }
      }
    }
    load();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItemRecord = {
      id: generateUUID(),
      name,
      code,
      category,
      default_unit: unit,
      current_balance: 0,
      reorder_level: parseFloat(reorderLevel) || 5
    };

    await syncEngine.saveOfflineMutation('InventoryItem', 'CREATE', newItem);
    setItems([newItem, ...items]);
    setShowItemModal(false);
    setName('');
    setCode('');
  };

  const handleStockReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(receiptQty) || 1;
    const target = items.find(i => i.id === selectedItemId);
    if (!target) return;

    const newBalance = target.current_balance + qty;
    const updated = items.map(i => i.id === selectedItemId ? { ...i, current_balance: newBalance } : i);
    setItems(updated);

    const updatedItem = { ...target, current_balance: newBalance };
    await syncEngine.saveOfflineMutation('InventoryItem', 'UPDATE', updatedItem);
    setShowReceiptModal(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.navInventory}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Item catalog, immutable stock ledger, receipts & issues</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (items.length > 0) setSelectedItemId(items[0].id);
                setShowReceiptModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Record Receipt</span>
            </button>
            <button
              onClick={() => setShowItemModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Catalog Item</span>
            </button>
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isLow = item.current_balance <= item.reorder_level;
            return (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                    <span className="text-[11px] font-mono text-gray-500">{item.code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-100 text-gray-700">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400">Current Balance:</span>
                    <p className={`text-xl font-bold ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                      {item.current_balance} <span className="text-xs font-normal text-gray-500">{item.default_unit}</span>
                    </p>
                  </div>
                  {isLow && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Reorder ({item.reorder_level})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Add Item to Catalog</h2>
              <form onSubmit={handleAddItem} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Item Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Item Code / SKU</label>
                    <input
                      required
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="FERTILIZER">Fertilizer</option>
                      <option value="SEED">Seed</option>
                      <option value="PESTICIDE">Pesticide</option>
                      <option value="FUEL">Fuel</option>
                      <option value="PACKAGING">Packaging</option>
                      <option value="TOOL">Tool</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Default Unit</label>
                    <input
                      required
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Reorder Level Alert</label>
                    <input
                      required
                      type="number"
                      value={reorderLevel}
                      onChange={(e) => setReorderLevel(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
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

        {/* Stock Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-gray-900">Record Stock Receipt (Inward)</h2>
              <form onSubmit={handleStockReceipt} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Select Item</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {items.map(it => (
                      <option key={it.id} value={it.id}>{it.name} ({it.code})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Quantity Received</label>
                    <input
                      required
                      type="number"
                      value={receiptQty}
                      onChange={(e) => setReceiptQty(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Unit Cost ($)</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="px-3 py-1.5 border rounded-md text-gray-700"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-800"
                  >
                    Commit Receipt to Ledger
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
