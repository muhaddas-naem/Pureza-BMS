import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Check, ChevronDown, Compass, Sparkles } from 'lucide-react';
import { getThanasByDistrict, searchThanas, ThanaItem, bdThanasData } from '../data/thanaData';

interface ThanaSearchSelectProps {
  value: string;
  onChange: (thana: string) => void;
  district?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const ThanaSearchSelect: React.FC<ThanaSearchSelectProps> = ({
  value,
  onChange,
  district = 'ঢাকা',
  placeholder = 'থানা / উপজেলা লিখুন বা সিলেক্ট করুন...',
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available thanas scoped to the currently selected district
  const districtThanas = getThanasByDistrict(district);

  // Filtered thanas based on search query (combines direct input and dropdown search)
  const effectiveQuery = searchQuery.trim() || value.trim();
  const matchedThanas = effectiveQuery
    ? searchThanas(effectiveQuery, district)
    : districtThanas;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When district changes, if current thana doesn't belong, keep it but provide fresh suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);
    setSearchQuery(text);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectThana = (item: ThanaItem) => {
    onChange(item.bn);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchQuery(value);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Searchable & Editable Input Box */}
      <div className="relative flex items-center">
        <Compass className="w-4 h-4 text-teal-600 absolute left-3 pointer-events-none shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500 hover:border-teal-500 transition-colors"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
              title="মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Popover Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 font-sans text-xs animate-fade-in">
          {/* Header with District Scope & Counter */}
          <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl mb-1.5 flex items-center justify-between text-[11px] border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-600" />
              <span>{district ? `${district} জেলার থানা/উপজেলা` : 'সকল থানা/উপজেলা'}</span>
            </span>
            <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
              {matchedThanas.length} টি
            </span>
          </div>

          {/* Quick Note: Custom text allowed */}
          <div className="px-2 pb-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>English ও বাংলা উভয় ভাষায় সার্চ ও কাস্টম নাম সাপোর্ট করে</span>
          </div>

          {/* Thanas List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {/* Custom Entry Option if user typed something unique */}
            {value.trim() &&
              !matchedThanas.some(
                (t) =>
                  t.bn.toLowerCase() === value.trim().toLowerCase() ||
                  t.en.toLowerCase() === value.trim().toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(value.trim());
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl mb-1 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 flex items-center justify-between hover:bg-teal-100/70 transition-colors cursor-pointer border border-teal-200/60 dark:border-teal-900/50"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">
                      কাস্টম হিসেবে রাখুন: <strong className="font-bold underline">{value.trim()}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-200/70 dark:bg-teal-800 text-teal-900 dark:text-teal-100 font-bold shrink-0">
                    Custom
                  </span>
                </button>
              )}

            {matchedThanas.length === 0 ? (
              <div className="p-4 text-center space-y-1">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">
                  তালিকায় পাওয়া যায়নি
                </p>
                <p className="text-[11px] text-slate-400">
                  আপনার টাইপ করা নাম <span className="font-bold text-teal-600">"{value}"</span> সরাসরি ব্যবহৃত হবে।
                </p>
              </div>
            ) : (
              matchedThanas.map((item, idx) => {
                const isSelected =
                  value.trim().toLowerCase() === item.bn.toLowerCase() ||
                  value.trim().toLowerCase() === item.en.toLowerCase();

                return (
                  <button
                    key={`${item.bn}-${item.districtBn}-${idx}`}
                    type="button"
                    onClick={() => handleSelectThana(item)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-xs">{item.bn}</span>
                      <span className="text-[11px] text-slate-400 font-normal truncate">
                        ({item.en})
                      </span>
                      {district !== item.districtBn && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.districtBn}
                        </span>
                      )}
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
