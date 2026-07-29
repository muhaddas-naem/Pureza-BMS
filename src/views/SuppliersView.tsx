import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Package,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
  FileText,
  History,
  Receipt,
  Eye,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier, SupplierTransaction } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addSupplierTransaction } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Single Supplier Ledger Detail Modal
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Add Transaction Modal State (for single supplier under detail or table action)
  const [txModalSupplier, setTxModalSupplier] = useState<Supplier | null>(null);
  const [txType, setTxType] = useState<'Purchase' | 'Payment' | 'Due Adjustment'>('Purchase');
  const [txTitle, setTxTitle] = useState('');
  const [txInvoiceNo, setTxInvoiceNo] = useState('');
  const [txItemsSummary, setTxItemsSummary] = useState('');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txPaidAmount, setTxPaidAmount] = useState<number>(0);
  const [txNotes, setTxNotes] = useState('');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states for Supplier Add/Edit
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productType, setProductType] = useState('');
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.productType && s.productType.toLowerCase().includes(q))
    );
  });

  const totalDue = suppliers.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
  const totalPaid = suppliers.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

  const handleOpenModal = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplier(sup);
      setName(sup.name);
      setCompany(sup.company);
      setPhone(sup.phone);
      setEmail(sup.email || '');
      setAddress(sup.address || '');
      setProductType(sup.productType || '');
      setDueAmount(sup.dueAmount || 0);
      setPaidAmount(sup.paidAmount || 0);
      setNotes(sup.notes || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setAddress('');
      setProductType('');
      setDueAmount(0);
      setPaidAmount(0);
      setNotes('');
    }
    setModalOpen(true);
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !phone.trim()) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name,
        company,
        phone,
        email,
        address,
        productType,
        dueAmount: Number(dueAmount),
        paidAmount: Number(paidAmount),
        notes,
      });
    } else {
      addSupplier({
        name,
        company,
        phone,
        email,
        address,
        productType,
        dueAmount: Number(dueAmount),
        paidAmount: Number(paidAmount),
        notes,
        transactions: [],
      });
    }
    setModalOpen(false);
  };

  // Open Add Transaction modal for single supplier
  const handleOpenAddTx = (sup: Supplier, defaultType: 'Purchase' | 'Payment' = 'Purchase') => {
    setTxModalSupplier(sup);
    setTxType(defaultType);
    setTxTitle(defaultType === 'Purchase' ? 'নতুন মালপত্র ক্রয় বিল' : 'বকেয়া টাকা পরিশোধ');
    setTxInvoiceNo(`SUP-INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setTxItemsSummary('');
    setTxAmount(0);
    setTxPaidAmount(0);
    setTxNotes('');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txModalSupplier) return;

    const calcDue = Math.max(0, txAmount - txPaidAmount);

    addSupplierTransaction(txModalSupplier.id, {
      type: txType,
      title: txTitle || 'সাপ্লায়ার ট্রানজেকশন',
      amount: Number(txAmount),
      paidAmount: Number(txPaidAmount),
      dueAmount: calcDue,
      date: txDate,
      invoiceNo: txInvoiceNo,
      itemsSummary: txItemsSummary,
      notes: txNotes,
    });

    // If currently inspecting this supplier in detail drawer, update local selectedSupplier reference
    if (selectedSupplier && selectedSupplier.id === txModalSupplier.id) {
      const refreshed = suppliers.find((s) => s.id === selectedSupplier.id);
      if (refreshed) setSelectedSupplier(refreshed);
    }

    setTxModalSupplier(null);
  };

  // Keep selectedSupplier synced with suppliers state
  const currentSelectedSup = selectedSupplier
    ? suppliers.find((s) => s.id === selectedSupplier.id) || selectedSupplier
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-teal-600" />
            সাপ্লায়ার ও পারচেজ লেজার ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            সিঙ্গেল সাপ্লায়ারের অধীনে নতুন ক্রয়, অর্ডার ও বকেয়া (Due) যোগ করুন এবং সম্পুর্ণ লেজার ট্র্যাকিং দেখুন।
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> নতুন সাপ্লায়ার যোগ করুন
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">মোট নিবন্ধিত সাপ্লায়ার</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{suppliers.length} জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">মোট বর্তমান বকেয়া (Due)</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">
              ৳{totalDue.toLocaleString('bn-BD')}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">মোট পরিশোধিত লেনদেন (Paid)</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{totalPaid.toLocaleString('bn-BD')}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="সাপ্লায়ার নাম, কোম্পানি, ফোন নাম্বার অথবা প্রোডাক্ট টাইপ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">সাপ্লায়ার ও কোম্পানি</th>
                <th className="py-3.5 px-4">যোগাযোগ তথ্য</th>
                <th className="py-3.5 px-4">মালামালের ধরন</th>
                <th className="py-3.5 px-4 text-right">পরিশোধিত টাকা</th>
                <th className="py-3.5 px-4 text-right">বর্তমান বকেয়া (Due)</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন / লেজার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    কোনো সাপ্লায়ারের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span>{sup.name}</span>
                        {(sup.transactions?.length || 0) > 0 && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold px-2 py-0.2 rounded-md">
                            {sup.transactions?.length} টি লেজার
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">{sup.company}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}
                      </div>
                      {sup.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3" /> {sup.email}
                        </div>
                      )}
                      {sup.address && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate max-w-xs">
                          <MapPin className="w-3 h-3" /> {sup.address}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium">
                        <Package className="w-3 h-3 text-teal-500" /> {sup.productType || 'সাধারণ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{(sup.paidAmount || 0).toLocaleString('bn-BD')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      {sup.dueAmount > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40">
                          ৳{sup.dueAmount.toLocaleString('bn-BD')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                          পরিশোধিত
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Detail / Ledger Button */}
                        <button
                          onClick={() => setSelectedSupplier(sup)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                          title="সাপ্লায়ার লেজার ও লেনদেন ইতিহাস দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-500" />
                          <span>ডিটেইলস</span>
                        </button>

                        {/* Quick Add Order/Due Button */}
                        <button
                          onClick={() => handleOpenAddTx(sup, 'Purchase')}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 cursor-pointer transition-all"
                          title="নতুন ক্রয়/অর্ডার বা ডিউ এন্ট্রি করুন"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ নতুন অর্ডার/ডিউ</span>
                        </button>

                        {/* Quick Pay Due Button */}
                        {sup.dueAmount > 0 && (
                          <button
                            onClick={() => handleOpenAddTx(sup, 'Payment')}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[11px] font-bold rounded-xl border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer transition-all"
                            title="বকেয়া পেমেন্ট করুন"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>পেমেন্ট</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenModal(sup)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(sup.id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Supplier Detail & Ledger Drawer / Modal */}
      {currentSelectedSup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 pt-1">
              <div className="flex items-center space-x-3 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    {currentSelectedSup.name} ({currentSelectedSup.company})
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>ফোন: {currentSelectedSup.phone}</span> • <span>পণ্য: {currentSelectedSup.productType || 'সাধারণ'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Overview Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">পরিশোধিত টাকা (Total Paid)</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ৳{(currentSelectedSup.paidAmount || 0).toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">বর্তমান বকেয়া (Current Due)</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1 block">
                  ৳{(currentSelectedSup.dueAmount || 0).toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">মোট লেনদেন নথি</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
                    {(currentSelectedSup.transactions?.length || 0)} টি এন্ট্রি
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAddTx(currentSelectedSup, 'Purchase')}
                  className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন ক্রয় / ডিউ</span>
                </button>
              </div>
            </div>

            {/* Supplier Profile Info Cards */}
            <div className="bg-teal-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-teal-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-6 space-y-1">
              <p className="font-bold text-slate-800 dark:text-white mb-1">অতিরিক্ত নোট ও তথ্য:</p>
              <p className="text-slate-600 dark:text-slate-400">{currentSelectedSup.notes || 'কোনো নোট উল্লেখ করা নেই।'}</p>
              {currentSelectedSup.address && <p><strong>ঠিকানা:</strong> {currentSelectedSup.address}</p>}
            </div>

            {/* Transactions / Orders Ledger Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  সাপ্লায়ার লেনদেন ও পারচেজ অর্ডার হিস্ট্রি (Ledger)
                </h4>
                {currentSelectedSup.dueAmount > 0 && (
                  <button
                    onClick={() => handleOpenAddTx(currentSelectedSup, 'Payment')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                  >
                    বকেয়া পরিশোধের এন্ট্রি করুন
                  </button>
                )}
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">তারিখ ও ইনভয়েস</th>
                      <th className="p-3">বিবরণ / শিরোনাম</th>
                      <th className="p-3 text-right">টাইপ</th>
                      <th className="p-3 text-right">মোট পরিমাণ</th>
                      <th className="p-3 text-right">পরিশোধিত</th>
                      <th className="p-3 text-right">অবশিষ্ট বকেয়া</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {!currentSelectedSup.transactions || currentSelectedSup.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          এখনও কোনো কাস্টম লেনদেন নথিভুক্ত করা হয়নি। ওপরের "+ নতুন ক্রয় / ডিউ" বাটনে ক্লিক করে যোগ করতে পারেন।
                        </td>
                      </tr>
                    ) : (
                      currentSelectedSup.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold">{tx.date}</div>
                            <div className="text-[10px] font-mono text-teal-600">{tx.invoiceNo || 'INV-NA'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{tx.title}</div>
                            {tx.itemsSummary && (
                              <div className="text-[11px] text-slate-500 mt-0.5">{tx.itemsSummary}</div>
                            )}
                            {tx.notes && <div className="text-[10px] text-slate-400 italic">{tx.notes}</div>}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                tx.type === 'Purchase'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : tx.type === 'Payment'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {tx.type === 'Purchase' ? 'ক্রয়/অর্ডার' : tx.type === 'Payment' ? 'পেমেন্ট' : 'অ্যাডজাস্টমেন্ট'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold">
                            ৳{tx.amount.toLocaleString('bn-BD')}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            ৳{tx.paidAmount.toLocaleString('bn-BD')}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-600">
                            ৳{tx.dueAmount.toLocaleString('bn-BD')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Transaction / Bill / Order Modal */}
      {txModalSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                সাপ্লায়ার ট্রানজেকশন এন্ট্রি - {txModalSupplier.name} ({txModalSupplier.company})
              </h3>
              <button onClick={() => setTxModalSupplier(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ট্রানজেকশন টাইপ
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Purchase">নতুন ক্রয় / অর্ডার (Purchase Bill)</option>
                    <option value="Payment">বকেয়া টাকা পরিশোধ (Payment)</option>
                    <option value="Due Adjustment">ডিউ অ্যাডজাস্টমেন্ট (Adjustment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  শিরোনাম / বিষয় *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৫০০ পিস কাচের বোতল ক্রয় বিল"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ইনভয়েস / রেফারেন্স নং
                  </label>
                  <input
                    type="text"
                    placeholder="SUP-INV-1002"
                    value={txInvoiceNo}
                    onChange={(e) => setTxInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    মোট বিল বা লেনদেন (৳) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    আজকের নগদে দেওয়া টাকা (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={txPaidAmount}
                    onChange={(e) => setTxPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    অবশিষ্ট নতুন বকেয়া (Due)
                  </label>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-rose-600">
                    ৳{Math.max(0, txAmount - txPaidAmount).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  মালপত্রের সংক্ষিপ্ত তালিকা / নোট
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: ড্রপার ৫০মিলি বোতল ২০০ পিস, ক্যাপ ৫০ পিস..."
                  value={txItemsSummary}
                  onChange={(e) => setTxItemsSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxModalSupplier(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  লেনদেন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> সাপ্লায়ার ডিলিট নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              আপনি কি নিশ্চিতভাবে এই সাপ্লায়ারের তথ্য মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deleteSupplier(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                {editingSupplier ? 'সাপ্লায়ার তথ্য সংশোধন' : 'নতুন সাপ্লায়ার যোগ করুন'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    সাপ্লায়ারের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: আব্দুল করিম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    কোম্পানির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: গ্রীন ভ্যালি কেমিক্যালস"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    ফোন নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    placeholder="supplier@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    সরবরাহকৃত পণ্য/টাইপ
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: প্যাকেজিং বোতল, কেমিক্যাল"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    ঠিকানা
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: তেজগাঁও, ঢাকা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    প্রাথমিক বকেয়া টাকা (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    প্রাথমিক পরিশোধিত টাকা (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  নোট / বিশেষ মন্তব্য
                </label>
                <textarea
                  rows={2}
                  placeholder="পেমেন্ট শর্ত বা বিষয়াবলী লিখুন..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
