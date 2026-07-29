import React, { useState } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  AlertTriangle,
  History,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InventoryView: React.FC = () => {
  const { products, inventoryLogs, adjustStock } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [actionType, setActionType] = useState<'Stock In' | 'Stock Out' | 'Adjustment'>('Stock In');
  const [quantity, setQuantity] = useState(10);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStockItems = products.filter((p) => p.currentStock === 0);

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    adjustStock(selectedProductId, actionType, quantity, notes, reference);
    setQuantity(10);
    setNotes('');
    setReference('');
    alert('ইনভেন্টরি স্টক সফলভাবে আপডেট করা হয়েছে!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" /> ইনভেন্টরি ম্যানেজমেন্ট ও স্টক সামঞ্জস্য
          </h2>
          <p className="text-xs text-slate-500">
            অর্ডার ডেলিভারি বা রিটার্নের সময় স্টক অটোমেটিক সিঙ্ক হয়
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> কম স্টক: {lowStockItems.length} টি
          </span>
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1">
            আউট অব স্টক: {outOfStockItems.length} টি
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Adjustment Form (1 Col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" /> দ্রুত স্টক ইন/আউট ফরম
          </h3>

          <form onSubmit={handleStockSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">পণ্য নির্বাচন করুন *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (বর্তমান: {p.currentStock} টি)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">লেনদেনের ধরণ *</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setActionType('Stock In')}
                  className={`py-2 rounded-lg text-[11px] ${
                    actionType === 'Stock In'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  স্টক ইন (+
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('Stock Out')}
                  className={`py-2 rounded-lg text-[11px] ${
                    actionType === 'Stock Out'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  স্টক আউট (-
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('Adjustment')}
                  className={`py-2 rounded-lg text-[11px] ${
                    actionType === 'Adjustment'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  সমন্বয় (±
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">পরিমাণ (Quantity) *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">রেফারেন্স নং (PO/অর্ডার নং)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="যেমন: PO-2026-004"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">কারণ বা নোট</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="যেমন: নতুন শিপমেন্ট কারখানা থেকে আসলো..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
            >
              স্টক তথ্য সেভ করুন
            </button>
          </form>
        </div>

        {/* Stock History Logs (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" /> স্টক ট্রানজিশন হিস্ট্রি লগ
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5">তারিখ</th>
                  <th className="py-2.5">পণ্য</th>
                  <th className="py-2.5 text-center">টাইপ</th>
                  <th className="py-2.5 text-center">পরিমাণ</th>
                  <th className="py-2.5 text-center">পূর্বের/নতুন</th>
                  <th className="py-2.5">দ্বারা/নোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {inventoryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-400 font-mono text-[10px]">{log.createdAt}</td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.productName}
                      {log.reference && (
                        <span className="block text-[10px] text-teal-600 font-mono">Ref: {log.reference}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.type === 'Stock In'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.type === 'Stock Out'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold">{log.quantity} টি</td>
                    <td className="py-3 text-center text-slate-500">
                      {log.previousStock} → <span className="font-bold text-slate-900 dark:text-white">{log.newStock}</span>
                    </td>
                    <td className="py-3 text-slate-500">
                      <div>{log.createdBy}</div>
                      <span className="text-[10px] italic">{log.notes || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
