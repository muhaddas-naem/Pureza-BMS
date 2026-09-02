import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Tag,
  DollarSign,
  Barcode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../../types';

export const ProductsView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Skincare');
  const [formBuyingPrice, setFormBuyingPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.slug && p.slug.toLowerCase().includes(term));
    const pCat = p.categoryName || p.categoryId;
    const matchesCat = selectedCategory === 'all' || pCat === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setFormName('');
    setFormSlug('');
    setFormCategory(categories[0]?.name || 'Skincare');
    setFormBuyingPrice(0);
    setFormSellingPrice(0);
    setFormStock(10);
    setFormMinStock(5);
    setFormSku(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormDescription('');
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug || '');
    setFormCategory(product.categoryName || product.categoryId);
    setFormBuyingPrice(product.buyingPrice);
    setFormSellingPrice(product.sellingPrice);
    setFormStock(product.currentStock);
    setFormMinStock(product.minStock);
    setFormSku(product.sku || '');
    setFormDescription(product.description || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const catObj = categories.find((c) => c.name === formCategory || c.id === formCategory);
    const catId = catObj?.id || 'cat-1';
    const catName = catObj?.name || formCategory;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        categoryId: catId,
        categoryName: catName,
        buyingPrice: Number(formBuyingPrice),
        sellingPrice: Number(formSellingPrice),
        currentStock: Number(formStock),
        minStock: Number(formMinStock),
        sku: formSku.trim(),
        description: formDescription.trim(),
      });
    } else {
      addProduct({
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        categoryId: catId,
        categoryName: catName,
        buyingPrice: Number(formBuyingPrice),
        sellingPrice: Number(formSellingPrice),
        currentStock: Number(formStock),
        minStock: Number(formMinStock),
        sku: formSku.trim(),
        description: formDescription.trim(),
        status: true,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-teal-600" />
            পণ্য ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট পণ্য: <strong className="text-teal-600 dark:text-teal-400">{products.length}</strong> টি
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পণ্য যোগ করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্যের নাম বা SKU কোড দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="p-3.5">পণ্য</th>
                <th className="p-3.5">ক্যাটাগরি</th>
                <th className="p-3.5 text-right">ক্রয় মূল্য</th>
                <th className="p-3.5 text-right">বিক্রয় মূল্য</th>
                <th className="p-3.5 text-center">স্টক পরিমাণ</th>
                <th className="p-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.currentStock <= product.minStock && product.currentStock > 0;
                  const isOut = product.currentStock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800 dark:text-white">
                        <div>{product.name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {product.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>}
                          {product.slug && (
                            <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono px-1.5 py-0.2 rounded border border-teal-200/50 dark:border-teal-800/50">
                              🔍 {product.slug}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {product.categoryName || product.categoryId}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                        ৳{product.buyingPrice.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3.5 text-right font-bold text-teal-600 dark:text-teal-400">
                        ৳{product.sellingPrice.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {product.currentStock} টি
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {editingProduct ? 'পণ্য সংশোধন' : 'নতুন পণ্য যোগ'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  placeholder="যেমন: খাঁটি সুন্দরবনের মধু (৫০০ গ্রাম)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ইংরেজি সার্চ কি-ওয়ার্ড / স্লাগ (Search Slug / Keywords)
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal ml-1.5">
                    (অর্ডার এন্ট্রির সময় দ্রুত ইংলিশে সার্চের জন্য, ইনভয়েসে দেখাবে না)
                  </span>
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs"
                  placeholder="যেমন: honey, modhu, sundarban honey"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যাটাগরি</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU কোড</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formBuyingPrice}
                    onChange={(e) => setFormBuyingPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বর্তমান স্টক</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">সর্বনিম্ন স্টক অ্যালার্ট</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">পণ্য মুছে ফেলবেন?</h3>
            <p className="text-xs text-slate-500">এই তথ্যটি মুছে ফেললে তা আর ফিরে পাওয়া যাবে না।</p>
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-md"
              >
                ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
