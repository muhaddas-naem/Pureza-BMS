import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  Truck,
  ShieldCheck,
  Database,
  Download,
  Users,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [businessName, setBusinessName] = useState(
    settings.companyName || settings.businessName || 'Pureza Natural Cosmetics'
  );
  const [tagline, setTagline] = useState(settings.tagline || '100% Organic Skincare & Wellness');
  const [phone, setPhone] = useState(settings.phone || '+880 1712-345678');
  const [email, setEmail] = useState(settings.email || 'support@pureza.com');
  const [address, setAddress] = useState(settings.address || 'House 42, Road 11, Block D, Banani, Dhaka');
  const [dhakaDelivery, setDhakaDelivery] = useState(settings.deliveryChargeInsideDhaka || 80);
  const [outsideDelivery, setOutsideDelivery] = useState(settings.deliveryChargeOutsideDhaka || 150);
  const [orderPrefix, setOrderPrefix] = useState(settings.invoicePrefix || settings.orderPrefix || 'PUR-2026-');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: businessName,
      businessName: businessName,
      tagline,
      phone,
      email,
      address,
      deliveryChargeInsideDhaka: dhakaDelivery,
      deliveryChargeOutsideDhaka: outsideDelivery,
      invoicePrefix: orderPrefix,
      orderPrefix: orderPrefix,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadSQL = () => {
    window.open('/api/db/export-sql', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* Floating Toast Notification */}
      {savedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-emerald-400">সেটিংস সফলভাবে আপডেট করা হয়েছে!</p>
            <p className="text-[11px] text-slate-300">ইনভয়েস ও ডেলিভারি তথ্য তাত্ক্ষণিকভাবে সেভ হয়ে গেছে।</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-teal-600" /> সিস্টেম সেটিংস ও কনফিগারেশন
          </h2>
          <p className="text-xs text-slate-500">ইনভয়েস তথ্য, ডেলিভারি চার্জ ও রোল ভিত্তিক এক্সেস সেটিংস</p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> সেটিংস সেভ হয়েছে!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Company Profile Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-teal-600" /> ১. প্রতিষ্ঠানের তথ্য (ইনভয়েসে প্রসেস হবে)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">প্রতিষ্ঠানের নাম *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">স্লোগান / ট্যাগলাইন</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">অফিসিয়াল ফোন নম্বর *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">অফিসিয়াল ইমেইল *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">অফিসের পূর্ণ ঠিকানা *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Delivery & Order Prefix Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Truck className="w-4 h-4 text-teal-600" /> ২. অর্ডার ও ডেলিভারি চার্জ কনফিগারেশন
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">ঢাকায় ডেলিভারি চার্জ (৳) *</label>
              <input
                type="number"
                min="0"
                required
                value={dhakaDelivery}
                onChange={(e) => setDhakaDelivery(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ঢাকার বাইরে চার্জ (৳) *</label>
              <input
                type="number"
                min="0"
                required
                value={outsideDelivery}
                onChange={(e) => setOutsideDelivery(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ইনভয়েস প্রফিক্স কোড *</label>
              <input
                type="text"
                required
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Database SQL Export Option */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="w-4 h-4 text-teal-600" /> ৩. MySQL ডাটাবেজ ব্যাকআপ ও SQL এক্সপোর্ট
          </h3>

          <p className="text-slate-500">
            নিচে ক্লিক করে পুরো সিস্টেমের কোর PHP & MySQL ডাটাবেজ স্কিমা ফাইল (.sql) ডাউনলোড করুন।
          </p>

          <button
            type="button"
            onClick={handleDownloadSQL}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-teal-400" /> PBMS Pure MySQL Schema (.sql) ডাউনলোড
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-2 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> সকল সেটিংস সেভ করুন
          </button>
        </div>
      </form>
    </div>
  );
};
