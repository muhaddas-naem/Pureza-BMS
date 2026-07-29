import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Layers,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustStock } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(true);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setSku('PUR-' + Math.floor(100 + Math.random() * 900));
    setBarcode('894000' + Math.floor(100000 + Math.random() * 900000));
    setBuyingPrice(200);
    setSellingPrice(450);
    setCurrentStock(20);
    setMinStock(5);
    setImage('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300');
    setDescription('');
    setStatus(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setBuyingPrice(p.buyingPrice);
    setSellingPrice(p.sellingPrice);
    setCurrentStock(p.currentStock);
    setMinStock(p.minStock);
    setImage(p.image || '');
    setDescription(p.description || '');
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        categoryId,
        sku,
        barcode,
        buyingPrice,
        sellingPrice,
        currentStock,
        minStock,
        image,
        description,
        status,
      });
    } else {
      addProduct({
        name,
        categoryId,
        sku,
        barcode,
        buyingPrice,
        sellingPrice,
        currentStock,
        minStock,
        image,
        description,
        status,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" /> পণ্য ও ইনভেন্টরি ক্যাটালগ
          </h2>
          <p className="text-xs text-slate-500">মোট নিবন্ধিত পণ্য: {products.length} টি</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> নতুন পণ্য যোগ করুন
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্যের নাম বা SKU নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
          >
            <option value="All">সকল ক্যাটাগরি (All Categories)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ছবি ও পণ্য</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">SKU / বারকোড</th>
                <th className="py-3 px-4 text-right">ক্রয়মূল্য</th>
                <th className="py-3 px-4 text-right">বিক্রয়মূল্য</th>
                <th className="py-3 px-4 text-center">বর্তমান স্টক</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3 gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400 m-3" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] text-slate-400">আইডি: {p.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {p.categoryName || 'সাধারণ'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-bold block">{p.sku}</span>
                        <span>{p.barcode || 'N/A'}</span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        ৳{p.buyingPrice}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-teal-600 dark:text-teal-400 text-sm">
                        ৳{p.sellingPrice}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.currentStock} টি
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.status
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.status ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => adjustStock(p.id, 'Stock In', 10, 'কুইক স্টক সংযোজন')}
                          className="px-2 py-1 bg-teal-50 text-teal-700 text-[11px] font-bold rounded-lg hover:bg-teal-100 cursor-pointer"
                          title="+১০ স্টক যোগ"
                        >
                          +১০ স্টক
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                          title="পণ্য ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 my-8">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {editingProduct ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: Pureza Glow Rose Water Serum 50ml"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">SKU কোড *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">বিক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">বর্তমান স্টক (Qty)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">সর্বনিম্ন স্টক সতর্কতা (Min Stock)</label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ছবি লিঙ্ক (Image URL)</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span>সক্রিয় পণ্য (Active Product)</span>
                </label>
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
      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">পণ্য নিশ্চিতকরণ মুছে ফেলুন</h3>
                <p className="text-xs text-slate-500">এই আইটেমটি স্থায়ীভাবে ডিলিট হয়ে যাবে</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{deletingProduct.name}</p>
              <p className="text-slate-500">SKU: {deletingProduct.sku} | বিক্রয়মূল্য: ৳{deletingProduct.sellingPrice}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
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
