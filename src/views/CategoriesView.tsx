import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<{ id: string; name: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (id: string, currentName: string, currentDesc?: string) => {
    setEditingId(id);
    setName(currentName);
    setDescription(currentDesc || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingId) {
      updateCategory(editingId, name, description);
    } else {
      addCategory(name, description);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-teal-600" /> পণ্য ক্যাটাগরি ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500">মোট ক্যাটাগরি: {categories.length} টি</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি যোগ করুন
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.description || 'কোনো বিবরণ দেওয়া নেই'}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(cat.id, cat.name, cat.description)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCat({ id: cat.id, name: cat.name })}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> পণ্য সংখ্যা:
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-full">
                  {count} টি পণ্য
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {editingId ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি তৈরি'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: স্কিনকেয়ার, হেয়ার কেয়ার"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Category Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">ক্যাটাগরি ডিলিট নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">ক্যাটাগরি '{deletingCat.name}' মুছে যাবে</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(deletingCat.id);
                  setDeletingCat(null);
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
