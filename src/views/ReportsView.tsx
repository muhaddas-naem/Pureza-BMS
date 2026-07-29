import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  PieChart,
  MapPin,
  Printer,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { orders, expenses, products } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Calculations
  const totalSales = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const totalCost = orders.reduce((acc, o) => {
    const itemCost = o.items.reduce((iAcc, item) => iAcc + item.buyingPrice * item.quantity, 0);
    return acc + itemCost;
  }, 0);

  const netProfit = totalSales - totalExpense - totalCost;

  // District wise breakdown map
  const districtMap: { [key: string]: number } = {};
  orders.forEach((o) => {
    districtMap[o.district] = (districtMap[o.district] || 0) + o.grandTotal;
  });

  const sortedDistricts = Object.entries(districtMap).sort((a, b) => b[1] - a[1]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" /> ব্যবসায়িক পারফরম্যান্স ও রিপোর্টস
          </h2>
          <p className="text-xs text-slate-500">বিক্রি, খরচ, লাভ ও জেলাভিত্তিক বিক্রির বিশদ বিশ্লেষণ</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setReportPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg ${reportPeriod === 'daily' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-500'}`}
            >
              আজকের
            </button>
            <button
              onClick={() => setReportPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg ${reportPeriod === 'monthly' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-500'}`}
            >
              মাসিক
            </button>
            <button
              onClick={() => setReportPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg ${reportPeriod === 'yearly' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-500'}`}
            >
              বার্ষিক
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" /> প্রিন্ট রিপোর্ট
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">মোট বিক্রয় রেভিনিউ</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ৳{totalSales.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-teal-600 mt-1 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> মোট {orders.length} টি সফল অর্ডার
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">পণ্য কেনা খরচ (COGS)</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ৳{totalCost.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">ইনভেন্টরি পণ্য ক্রয় বাবদ</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">পরিচালনা ও মার্কেটিং খরচ</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">
            ৳{totalExpense.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">অফিস, কুরিয়ার ও বিজ্ঞাপন খরচ</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">খাঁটি নিট প্রফিট / লাভ</span>
          <h3 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ৳{netProfit.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-1 font-bold">
            প্রফিট মার্জিন: {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Wise Sales Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-teal-600" /> জেলাভিত্তিক বিক্রির র‍্যাংকিং (District Sales)
          </h3>

          <div className="space-y-3">
            {sortedDistricts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">কোনো তথ্য নেই</p>
            ) : (
              sortedDistricts.map(([district, amount], index) => {
                const percentage = totalSales > 0 ? (amount / totalSales) * 100 : 0;
                return (
                  <div key={district} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        {district}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        ৳{amount.toLocaleString('bn-BD')} ({percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Courier Performance Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Award className="w-4 h-4 text-teal-600" /> কুরিয়ার সার্ভিস পারফরম্যান্স
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {['Pathao', 'Steadfast', 'RedX', 'Paperfly'].map((cour) => {
              const courOrders = orders.filter((o) => o.courier === cour);
              const courTotal = courOrders.reduce((acc, o) => acc + o.grandTotal, 0);

              return (
                <div key={cour} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{cour} Courier</h4>
                  <p className="text-slate-500">অর্ডার বুকিং: {courOrders.length} টি</p>
                  <p className="font-black text-teal-600 text-sm pt-1">৳{courTotal.toLocaleString('bn-BD')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
