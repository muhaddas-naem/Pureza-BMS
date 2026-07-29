import React, { useState } from 'react';
import { Receipt, Plus, Search, Trash2, Edit2, Tags, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';

export const ExpensesView: React.FC = () => {
  const { expenses, expenseCategories, addExpense, updateExpense, deleteExpense, setActiveTab } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]?.name || 'অফিস ভাড়া');
  const [amount, setAmount] = useState(1000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('এডমিন');
  const [notes, setNotes] = useState('');

  const filteredExpenses = (expenses || []).filter((e) => {
    if (!e) return false;
    const expCatName = e.category || e.categoryName || '';
    const expTitle = e.title || e.description || '';
    const expPaidBy = e.paidBy || 'এডমিন';
    const matchesCategory = filterCategory === 'All' || expCatName === filterCategory;
    const matchesSearch =
      expTitle.toLowerCase().includes(search.toLowerCase()) ||
      expCatName.toLowerCase().includes(search.toLowerCase()) ||
      expPaidBy.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory(expenseCategories[0]?.name || 'অফিস ভাড়া');
    setAmount(1000);
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('এডমিন');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category || exp.categoryName || 'অফিস ভাড়া');
    setAmount(exp.amount);
    setDate(exp.date);
    setPaidBy(exp.paidBy || 'এডমিন');
    setNotes(exp.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        title: title.trim(),
        category,
        categoryName: category,
        amount,
        date,
        paidBy,
        notes,
      });
    } else {
      addExpense({
        title: title.trim(),
        category,
        categoryName: category,
        amount,
        date,
        paidBy,
        notes,
      });
    }

    setModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" /> বিজনেস খরচ ও এক্সপেন্স ট্র্যাকার
          </h2>
          <p className="text-xs text-slate-500">
            ফিল্টারকৃত মোট খরচ: <span className="font-bold text-rose-600">৳{totalExpense.toLocaleString('bn-BD')}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('expense-categories')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Tags className="w-4 h-4 text-amber-500" /> খরচের ক্যাটাগরি
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন খরচ যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="খরচের বিবরণ বা প্রদানকারী দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
          >
            <option value="All">সকল খরচের খাত (All Categories)</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">খরচের খাত</th>
                <th className="py-3 px-4">বিবরণ</th>
                <th className="py-3 px-4 text-right">পরিমাণ (৳)</th>
                <th className="py-3 px-4">প্রদানকারী</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    কোনো খরচের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-teal-700 dark:text-teal-400">
                      {exp.category || exp.categoryName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {exp.title || exp.description || 'খরচের বিবরণ'}
                      {exp.notes && <p className="text-[10px] text-slate-400 font-normal">{exp.notes}</p>}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                      ৳{(exp.amount || 0).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{exp.paidBy || 'এডমিন'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg cursor-pointer transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(exp)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer transition-colors"
                          title="ডিলিট"
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

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {editingExpense ? 'খরচের হিসাব আপডেট করুন' : 'নতুন খরচের হিসাব লিপিবদ্ধকরণ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">খরচের খাত (Category) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">খরচের মূল শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: মার্চ মাসের অফিস স্পেস ভাড়া প্রদান"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-rose-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রদানকারী (Paid By)</label>
                <input
                  type="text"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">অতিরিক্ত তথ্য বা ভাউচার নোট</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingExpense ? 'আপডেট করুন' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">খরচের রেকর্ড মুছে ফেলুন</h3>
                <p className="text-xs text-slate-500">এই খরচের হিসেবটি স্থায়ীভাবে মুছে যাবে</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{deletingExpense.title}</p>
              <p className="text-slate-500">খাত: {deletingExpense.category || deletingExpense.categoryName} | পরিমাণ: ৳{deletingExpense.amount}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(deletingExpense.id);
                  setDeletingExpense(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
