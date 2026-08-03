import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Check, ChevronDown } from 'lucide-react';
import { bdDistrictsList, searchDistricts, DistrictItem } from '../data/districtData';

interface DistrictSearchSelectProps {
  value: string;
  onChange: (districtBn: string) => void;
  className?: string;
  placeholder?: string;
}

export const DistrictSearchSelect: React.FC<DistrictSearchSelectProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'জেলা খুঁজুন বা সিলেক্ট করুন...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const matchedItems = searchDistricts(searchQuery);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = bdDistrictsList.find((d) => d.bn === value || d.en.toLowerCase() === value.toLowerCase());
  const displayLabel = selectedItem ? `${selectedItem.bn} (${selectedItem.en})` : value || 'জেলা নির্বাচন করুন';

  const handleSelect = (item: DistrictItem) => {
    onChange(item.bn);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button & Search Input Combo */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
      >
        <div className="flex items-center gap-2 truncate text-xs">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 font-sans text-xs animate-fade-in">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ইংরেজি বা বাংলায় জেলা খুঁজুন (e.g. Dhaka, Cumilla)..."
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

          {/* Quick Select Count */}
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
            <span>বাংলাদেশ ৬৪ জেলা ({matchedItems.length} টি পাওয়া গেছে)</span>
            {searchQuery && <span className="text-teal-600">English / বাংলা সার্চ সক্রিয়</span>}
          </div>

          {/* Districts List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {matchedItems.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                কোনো জেলা খুঁজে পাওয়া যায়নি
              </div>
            ) : (
              matchedItems.map((item) => {
                const isSelected = value === item.bn;
                return (
                  <button
                    key={item.bn}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.bn}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({item.en})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
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
