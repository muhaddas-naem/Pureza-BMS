import React, { useState } from 'react';
import { Building2, Plus, Phone, Mail, MapPin, Search, Edit2, Trash2, X, DollarSign, Receipt, History, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier, SupplierTransaction } from '../../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addSupplierTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Transaction ledger modal state
  const [activeSupplierForTx, setActiveSupplierForTx] = useState<Supplier | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [txType, setTxType] = useState<'Purchase' | 'Payment' | 'Due Adjustment'>('Payment');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPaid, setTxPaid] = useState('');
  const [txDue, setTxDue] = useState('');
  const [txInvoiceNo, setTxInvoiceNo] = useState('');
  const [txNotes, setTxNotes] = useState('');

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productType, setProductType] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.phone.includes(searchTerm) ||
      (s.productType && s.productType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDues = suppliers.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
  const totalPaid = suppliers.reduce((acc, s) => acc + (s.paidAmount || 0), 0);

  const openAdd = () => {
    setEditingSupplier(null);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setProductType('');
    setIsModalOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setCompanyName(supplier.company || '');
    setPhone(supplier.phone);
    setEmail(supplier.email || '');
    setAddress(supplier.address || '');
    setProductType(supplier.productType || '');
    setIsModalOpen(true);
  };

  const openTxModal = (supplier: Supplier) => {
    setActiveSupplierForTx(supplier);
    setTxType('Payment');
    setTxTitle('পেমেন্ট পরিশোধ');
    setTxAmount('');
    setTxPaid('');
    setTxDue('');
    setTxInvoiceNo(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
    setTxNotes('');
    setIsTxModalOpen(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplierForTx || !txTitle.trim()) return;

    const amt = Number(txAmount) || 0;
    const paid = Number(txPaid) || (txType === 'Payment' ? amt : 0);
    const due = Number(txDue) || (txType === 'Purchase' ? Math.max(0, amt - paid) : 0);

    addSupplierTransaction(activeSupplierForTx.id, {
      type: txType,
      title: txTitle.trim(),
      amount: amt,
      paidAmount: paid,
      dueAmount: due,
      date: new Date().toLocaleDateString('bn-BD'),
      invoiceNo: txInvoiceNo,
      notes: txNotes,
    });

    setIsTxModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: name.trim(),
        company: companyName.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        productType: productType.trim(),
      });
    } else {
      addSupplier({
        name: name.trim(),
        company: companyName.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        productType: productType.trim(),
        dueAmount: 0,
        paidAmount: 0,
        createdAt: new Date().toLocaleDateString('bn-BD'),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-teal-600" />
            সাপ্লায়ার অ্যাডভান্সড ডিরেক্টরি
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট সাপ্লায়ার: <strong className="text-teal-600 dark:text-teal-400">{suppliers.length}</strong> জন | মোট বকেয়া: <strong className="text-rose-600">৳{totalDues.toLocaleString('bn-BD')}</strong>
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সাপ্লায়ার যোগ</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <Building2 className="w-8 h-8 text-teal-600 p-1.5 bg-teal-50 dark:bg-teal-950 rounded-xl" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold">মোট সাপ্লায়ার</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{suppliers.length} টি কোম্পানি</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <ArrowUpRight className="w-8 h-8 text-rose-600 p-1.5 bg-rose-50 dark:bg-rose-950 rounded-xl" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold">মোট পাওনা/বকেয়া (Due)</p>
            <p className="text-base font-extrabold text-rose-600">৳{totalDues.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <ArrowDownRight className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-xl" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold">মোট পরিশোধিত (Paid)</p>
            <p className="text-base font-extrabold text-emerald-600">৳{totalPaid.toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="সাপ্লায়ার, প্রোডাক্ট টাইপ বা কোম্পানির নাম দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{supplier.company || supplier.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">যোগাযোগ: {supplier.name}</p>
                {supplier.productType && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                    {supplier.productType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(supplier)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 cursor-pointer"
                  title="সংশোধন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteSupplier(supplier.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">পরিশোধিত</span>
                <strong className="text-emerald-600 font-bold">৳{(supplier.paidAmount || 0).toLocaleString('bn-BD')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">বকেয়া</span>
                <strong className="text-rose-600 font-bold">৳{(supplier.dueAmount || 0).toLocaleString('bn-BD')}</strong>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {supplier.phone}
              </p>
              {supplier.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {supplier.email}
                </p>
              )}
              {supplier.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {supplier.address}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => openTxModal(supplier)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট / লেনদেন রেকর্ড</span>
              </button>
            </div>

            {/* Transactions History Summary */}
            {supplier.transactions && supplier.transactions.length > 0 && (
              <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <p className="font-bold text-slate-400 flex items-center gap-1">
                  <History className="w-3 h-3 text-teal-600" />
                  সর্বশেষ লেনদেনসমূহ ({supplier.transactions.length})
                </p>
                {supplier.transactions.slice(0, 2).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{tx.title} ({tx.date})</span>
                    <strong className={tx.type === 'Payment' ? 'text-emerald-600' : 'text-rose-600'}>
                      ৳{tx.amount.toLocaleString('bn-BD')}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Supplier Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {editingSupplier ? 'সাপ্লায়ার তথ্য পরিবর্তন' : 'নতুন সাপ্লায়ার এন্ট্রি'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">যোগাযোগ ব্যক্তির নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">কোম্পানির নাম</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রোডাক্ট ক্যাটাগরি / টাইপ</label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="যেমন: স্কিনকেয়ার র-মেটেরিয়াল, মেকআপ বক্স"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Entry Modal */}
      {isTxModalOpen && activeSupplierForTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                  লেনদেন এন্ট্রি - {activeSupplierForTx.company || activeSupplierForTx.name}
                </h3>
                <p className="text-[11px] text-slate-400">বর্তমান বকেয়া: ৳{(activeSupplierForTx.dueAmount || 0).toLocaleString('bn-BD')}</p>
              </div>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">লেনদেনের ধরণ</label>
                <select
                  value={txType}
                  onChange={(e) => {
                    const val = e.target.value as 'Purchase' | 'Payment' | 'Due Adjustment';
                    setTxType(val);
                    if (val === 'Payment') setTxTitle('পেমেন্ট পরিশোধ');
                    else if (val === 'Purchase') setTxTitle('নতুন কাঁচামাল ক্রয়');
                    else setTxTitle('বকেয়া এডজাস্টমেন্ট');
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                >
                  <option value="Payment">পেমেন্ট পরিশোধ (Payment)</option>
                  <option value="Purchase">নতুন পণ্য ক্রয় (Purchase)</option>
                  <option value="Due Adjustment">এডজাস্টমেন্ট (Due Adjustment)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিবরণ/টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">টাকার পরিমাণ (৳)</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইনভয়েস/মেমো নং</label>
                  <input
                    type="text"
                    value={txInvoiceNo}
                    onChange={(e) => setTxInvoiceNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">নোট / বিস্তারিত</label>
                <textarea
                  rows={2}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  রেকর্ড করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

