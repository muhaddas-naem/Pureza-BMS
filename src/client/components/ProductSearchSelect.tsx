import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, X, Check, ChevronDown, Tag } from 'lucide-react';
import { Product } from '../types';

interface ProductSearchSelectProps {
  products: Product[];
  selectedProductId: string;
  onChange: (productId: string) => void;
  className?: string;
}

export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  products,
  selectedProductId,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchSku = p.sku.toLowerCase().includes(q);
    const matchCategory = p.categoryName?.toLowerCase().includes(q);
    const matchPrice = p.sellingPrice.toString().includes(q);
    return matchName || matchSku || matchCategory || matchPrice;
  });

  const handleSelect = (productId: string) => {
    onChange(productId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors text-xs"
      >
        <div className="flex items-center gap-2 truncate">
          <Package className="w-4 h-4 text-teal-600 shrink-0" />
          {selectedProduct ? (
            <div className="truncate flex items-center gap-2">
              <span className="font-bold truncate">{selectedProduct.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px] shrink-0">
                স্টক: {selectedProduct.currentStock} পিস
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">
                ৳{selectedProduct.sellingPrice}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">পণ্য নির্বাচন বা সার্চ করুন...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 font-sans text-xs animate-fade-in min-w-[280px]">
          {/* Live Search Field */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের নাম, SKU, বা ক্যাটাগরি লিখুন..."
              className="w-full pl-8 pr-7 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Header info */}
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
            <span>পণ্য তালিকা ({filteredProducts.length} টি পাওয়া গেছে)</span>
            {searchQuery && <span className="text-teal-600">ফিল্টার ফিল্ড সক্রিয়</span>}
          </div>

          {/* Product Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                কোনো পণ্য পাওয়া যায়নি
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = p.id === selectedProductId;
                const isLowStock = p.currentStock <= p.minStockAlert;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 text-teal-600 font-bold text-xs">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{p.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>SKU: {p.sku}</span>
                          {p.categoryName && <span>• {p.categoryName}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <div className="font-bold text-teal-600 dark:text-teal-400 text-xs">৳{p.sellingPrice}</div>
                      <div
                        className={`text-[10px] font-bold ${
                          isLowStock ? 'text-rose-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        স্টক: {p.currentStock} পিস
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
