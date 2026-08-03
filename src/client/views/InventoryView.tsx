import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  History,
  Plus,
  Minus,
  SlidersHorizontal,
  Search,
  Filter,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  PackageX,
  PackageCheck,
  RefreshCw,
  X,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../../types';

export const InventoryView: React.FC = () => {
  const { products, categories, inventoryLogs, adjustStock } = useApp();

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'out' | 'logs'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Stock Adjustment Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [actionType, setActionType] = useState<'Stock In' | 'Stock Out' | 'Adjustment'>('Stock In');
  const [quantity, setQuantity] = useState<number>(10);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Quick Refill Modal state for a specific product
  const [refillModalProduct, setRefillModalProduct] = useState<Product | null>(null);
  const [quickQty, setQuickQty] = useState<number>(20);
  const [quickRef, setQuickRef] = useState<string>('');
  const [quickNote, setQuickNote] = useState<string>('স্টক রিফিল / রিকুইজিশন আগমন');

  // Purchase Requisition Modal
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Financial & Stock Valuation Metrics
  const totalStockBuyingValue = products.reduce((acc, p) => acc + p.currentStock * p.buyingPrice, 0);
  const totalStockSellingValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const potentialInventoryProfit = totalStockSellingValue - totalStockBuyingValue;

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStockItems = products.filter((p) => p.currentStock === 0);
  const healthyStockItems = products.filter((p) => p.currentStock > p.minStock);

  // Items needing replenishment (Low + Out of stock)
  const reorderItems = products.filter((p) => p.currentStock <= p.minStock);
  const totalReplenishmentCost = reorderItems.reduce((sum, p) => {
    const needed = Math.max(p.minStock * 2 - p.currentStock, 10);
    return sum + needed * p.buyingPrice;
  }, 0);

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    // Tab filter
    if (activeTab === 'low' && (p.currentStock > p.minStock || p.currentStock === 0)) return false;
    if (activeTab === 'out' && p.currentStock > 0) return false;

    // Category filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchSku = p.sku.toLowerCase().includes(term);
      const matchCat = p.categoryName?.toLowerCase().includes(term) || false;
      return matchName || matchSku || matchCat;
    }

    return true;
  });

  // Handle Form Stock Adjustment
  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    const prod = products.find((p) => p.id === selectedProductId);
    adjustStock(selectedProductId, actionType, quantity, notes, reference);

    setQuantity(10);
    setNotes('');
    setReference('');
    alert(`অর্ডার/স্টক সিঙ্ক: ${prod?.name || 'পণ্য'} এর স্টক (${actionType}) আপডেট সফল হয়েছে!`);
  };

  // Handle Quick Modal Refill
  const handleQuickRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillModalProduct || quickQty <= 0) return;

    adjustStock(
      refillModalProduct.id,
      'Stock In',
      quickQty,
      quickNote || 'কুইক স্টক ইন',
      quickRef || 'QUICK-IN-' + Date.now().toString().slice(-4)
    );

    setRefillModalProduct(null);
    setQuickQty(20);
    setQuickRef('');
    setQuickNote('স্টক রিফিল / রিকুইজিশন আগমন');
  };

  // Generate Text for Purchase Requisition
  const generateRequisitionText = () => {
    let text = `📦 সাপ্লায়ার পারচেজ রিকুইজিশন স্লিপ (Pureza ERP)\n`;
    text += `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n`;
    text += `--------------------------------------------------\n`;
    reorderItems.forEach((p, idx) => {
      const needed = Math.max(p.minStock * 2 - p.currentStock, 10);
      text += `${idx + 1}. ${p.name} (SKU: ${p.sku})\n`;
      text += `   বর্তমান স্টক: ${p.currentStock} টি | প্রদেয় রিকুইজিশন: ${needed} টি | আনুমানিক দাম: ৳${needed * p.buyingPrice}\n`;
    });
    text += `--------------------------------------------------\n`;
    text += `সর্বমোট অনুমিত ক্রয়ামূল্য: ৳${totalReplenishmentCost.toLocaleString('bn-BD')}\n`;
    text += `অনুরোধকারী: Pureza ERP Inventory Admin`;
    return text;
  };

  const handleCopyRequisition = () => {
    navigator.clipboard.writeText(generateRequisitionText());
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Header & Quick Requisition Action */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-600" /> ইনভেন্টরি ও স্টক কমান্ড সেন্টার
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            স্মার্ট কম-স্টক অ্যালার্ট, স্টক ভ্যালুয়েশন ও স্বয়ংক্রিয় পারচেজ রিকুইজিশন স্লিপ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reorderItems.length > 0 && (
            <button
              onClick={() => setShowRequisitionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>পারচেজ রিকুইজিশন স্লিপ ({reorderItems.length})</span>
            </button>
          )}

          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> কম স্টক: {lowStockItems.length}
            </span>
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1">
              <PackageX className="w-3.5 h-3.5 text-slate-400" /> আউট অব স্টক: {outOfStockItems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Stock Valuation Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">স্টক ক্রয়মূল্য ভ্যালুয়েশন</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{totalStockBuyingValue.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">মোট {products.length} টি আইটেমের মজুদ ইনভেস্টমেন্ট</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">প্রত্যাশিত বিক্রয় মূল্য</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ৳{totalStockSellingValue.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            +৳{potentialInventoryProfit.toLocaleString('bn-BD')} অনুমিত প্রফিট
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">স্টক হেলথ স্ট্যাটাস</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {healthyStockItems.length} / {products.length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {healthyStockItems.length} টি পণ্য পর্যাপ্ত মজুদে আছে
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">প্রয়োজনীয় রিফিল ক্যাপিটাল</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600 mt-2">
            ৳{totalReplenishmentCost.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">
            {reorderItems.length} টি পণ্য রিফিল করার অনুমিত খরচ
          </p>
        </div>
      </div>

      {/* Main Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>সব পণ্য ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('low')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'low'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>কম স্টক এলার্ট ({lowStockItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('out')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <PackageX className="w-3.5 h-3.5" />
              <span>স্টক ফুরিয়েছে ({outOfStockItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-teal-500" />
              <span>হিস্ট্রি লগ ({inventoryLogs.length})</span>
            </button>
          </div>

          {/* Search & Category Filter (Active when not in logs) */}
          {activeTab !== 'logs' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="পণ্য, SKU বা বারকোড খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'logs' ? (
        /* Stock History Transition Logs Table */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" /> স্টক ইন, আউট ও এডজাস্টমেন্ট হিস্ট্রি ট্র্যাকার
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5">তারিখ ও সময়</th>
                  <th className="py-2.5">পণ্য নাম</th>
                  <th className="py-2.5 text-center">টাইপ</th>
                  <th className="py-2.5 text-center">পরিমাণ</th>
                  <th className="py-2.5 text-center">পূর্বের/নতুন স্টক</th>
                  <th className="py-2.5">ইউজার / রেফারেন্স / কারণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {inventoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      কোনো স্টক ট্রানজিশন হিস্ট্রি পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  inventoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 text-slate-400 font-mono text-[10px]">{log.createdAt}</td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        {log.productName}
                        {log.reference && (
                          <span className="block text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                            Ref: {log.reference}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                      <td className="py-3 text-center font-black text-slate-900 dark:text-white">
                        {log.quantity} টি
                      </td>
                      <td className="py-3 text-center text-slate-500 font-mono">
                        {log.previousStock} →{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{log.newStock}</span>
                      </td>
                      <td className="py-3 text-slate-500">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{log.createdBy}</div>
                        <span className="text-[10px] italic">{log.notes || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Table and Quick Adjustment Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Top Product Inventory Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" /> পণ্য অনুযায়ী মজুদ স্ট্যাটাস ({filteredProducts.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                মজুদ অটোমেটিক আপডেট রাখতে রিকুইজিশন ব্যবহার করুন
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5">পণ্য ও SKU</th>
                    <th className="py-2.5 text-center">মজুদ স্ট্যাটাস</th>
                    <th className="py-2.5 text-center">বর্তমান স্টক</th>
                    <th className="py-2.5 text-center">ক্রয় মূল্য</th>
                    <th className="py-2.5 text-center">মোট ভ্যালু</th>
                    <th className="py-2.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        কোনো পণ্য পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOut = p.currentStock === 0;
                      const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
                      const stockRatio = Math.min(100, Math.round((p.currentStock / (p.minStock * 2 || 20)) * 100));

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-9 h-9 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                  <Boxes className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{p.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span className="font-mono text-teal-600 dark:text-teal-400">SKU: {p.sku}</span>
                                  <span>•</span>
                                  <span>{p.categoryName || 'General'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 text-center">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black inline-flex items-center gap-1">
                                <PackageX className="w-3 h-3" /> আউট অব স্টক
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> কম স্টক (Min: {p.minStock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> পর্যাপ্ত (Healthy)
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-center">
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {p.currentStock} টি
                            </div>
                            {/* Stock Health Progress Bar */}
                            <div className="w-20 mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full transition-all rounded-full ${
                                  isOut ? 'w-0' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${stockRatio}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-300">
                            ৳{p.buyingPrice}
                          </td>

                          <td className="py-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                            ৳{(p.currentStock * p.buyingPrice).toLocaleString('bn-BD')}
                          </td>

                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setRefillModalProduct(p);
                                setQuickQty(Math.max(p.minStock * 2 - p.currentStock, 10));
                              }}
                              className="px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[11px] font-bold rounded-lg border border-teal-200 dark:border-teal-800/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>কুইক স্টক ইন</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Stock Adjustment Manual Form (1 Col) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" /> স্টক ম্যানুয়াল সামঞ্জস্য ফরম
            </h3>

            <form onSubmit={handleStockSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  পণ্য নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (বর্তমান: {p.currentStock} টি)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  লেনদেনের ধরণ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                  <button
                    type="button"
                    onClick={() => setActionType('Stock In')}
                    className={`py-2 rounded-lg text-[11px] transition-all cursor-pointer ${
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
                    className={`py-2 rounded-lg text-[11px] transition-all cursor-pointer ${
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
                    className={`py-2 rounded-lg text-[11px] transition-all cursor-pointer ${
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
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  পরিমাণ (Quantity) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  রেফারেন্স নম্বর (PO / চালান / ইনভয়েস)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="যেমন: PO-2026-0801"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  কারণ বা মন্তব্য
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="যেমন: নতুন শিপমেন্ট ফ্যাক্টরি থেকে পৌঁছেছে..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                স্টক ডাটা সেভ ও সিঙ্ক করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Refill Modal */}
      {refillModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" /> কুইক স্টক ইন (Quick Stock Refill)
              </h3>
              <button
                onClick={() => setRefillModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">{refillModalProduct.name}</div>
              <div className="text-slate-500 font-mono">SKU: {refillModalProduct.sku}</div>
              <div className="flex items-center gap-3 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>বর্তমান স্টক: <strong className="text-teal-600">{refillModalProduct.currentStock} টি</strong></span>
                <span>মিনিমাম থ্রেশহোল্ড: <strong>{refillModalProduct.minStock} টি</strong></span>
              </div>
            </div>

            <form onSubmit={handleQuickRefillSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  যোগ করার পরিমাণ (Stock In Quantity) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickQty}
                  onChange={(e) => setQuickQty(parseInt(e.target.value) || 1)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-lg text-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  চালান / পারচেজ অর্ডার নম্বর
                </label>
                <input
                  type="text"
                  value={quickRef}
                  onChange={(e) => setQuickRef(e.target.value)}
                  placeholder="যেমন: PO-SUPPLIER-882"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  নোট / মন্তব্য
                </label>
                <input
                  type="text"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRefillModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  স্টক বৃদ্ধি করুন (+
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Requisition Slip Modal */}
      {showRequisitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 font-sans animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> সাপ্লায়ার পারচেজ রিকুইজিশন স্লিপ (Purchase Order Request)
                </h3>
                <p className="text-xs text-slate-400">
                  কম স্টক ও স্টক-আউট পণ্যের সাপ্লায়ার অর্ডারের জন্য স্বয়ংক্রিয় তৈরি স্লিপ
                </p>
              </div>
              <button
                onClick={() => setShowRequisitionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  তারিখ: {new Date().toLocaleDateString('bn-BD')}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  মোট আইটেম: {reorderItems.length} টি
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2">পণ্য নাম</th>
                      <th className="py-2 text-center">বর্তমান স্টক</th>
                      <th className="py-2 text-center">প্রস্তাবিত রিকুইজিশন</th>
                      <th className="py-2 text-right">ক্রয় মূল্য</th>
                      <th className="py-2 text-right">মোট সাবটোটাল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reorderItems.map((p) => {
                      const needed = Math.max(p.minStock * 2 - p.currentStock, 10);
                      return (
                        <tr key={p.id}>
                          <td className="py-2 font-bold text-slate-800 dark:text-slate-200">
                            {p.name}
                            <span className="block text-[10px] font-mono text-slate-400">SKU: {p.sku}</span>
                          </td>
                          <td className="py-2 text-center font-bold text-rose-500">{p.currentStock} টি</td>
                          <td className="py-2 text-center font-bold text-teal-600 dark:text-teal-400">
                            +{needed} টি
                          </td>
                          <td className="py-2 text-right font-mono">৳{p.buyingPrice}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ৳{(needed * p.buyingPrice).toLocaleString('bn-BD')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-extrabold text-sm text-slate-900 dark:text-white">
                <span>সর্বমোট অনুমিত ক্রয়ামূল্য:</span>
                <span className="text-teal-600 dark:text-teal-400">
                  ৳{totalReplenishmentCost.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleCopyRequisition}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Copy className="w-4 h-4 text-teal-500" />
                <span>{copiedNotification ? 'কপি হয়েছে ✓' : 'টেক্সট ফাইল কপি করুন'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট পারচেজ রিকুইজিশন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
