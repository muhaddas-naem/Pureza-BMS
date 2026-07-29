import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  PackageCheck,
  Truck,
  XCircle,
  RotateCcw,
  Receipt,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Printer,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    orders,
    products,
    customers,
    expenses,
    setActiveTab,
    openInvoiceModal,
    activityLogs,
    adjustStock,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Sales Calculations
  const todayOrders = orders.filter((o) => o.date === todayStr);
  const todaySales = todayOrders.reduce((acc, o) => acc + o.grandTotal, 0);

  const monthlySales = orders.reduce((acc, o) => acc + o.grandTotal, 0);

  // Status Counts
  const pendingCount = orders.filter((o) => o.orderStatus === 'New' || o.orderStatus === 'Confirmed').length;
  const processingCount = orders.filter((o) => o.orderStatus === 'Processing').length;
  const packedCount = orders.filter((o) => o.orderStatus === 'Packed').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;
  const returnedCount = orders.filter((o) => o.orderStatus === 'Returned').length;

  // Expense Calculations
  const todayExpenses = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  const monthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Net Profit (Total Sales - Total Expenses - Estimated Buying Costs)
  const totalCost = orders.reduce((acc, o) => {
    const itemCost = o.items.reduce((iAcc, item) => iAcc + item.buyingPrice * item.quantity, 0);
    return acc + itemCost;
  }, 0);

  const netProfit = monthlySales - monthlyExpenses - totalCost;

  // Low Stock Items
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock);

  // Top Selling Products Calculation
  const productSalesMap: { [key: string]: { name: string; qty: number; total: number; image?: string } } = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const prod = products.find((p) => p.id === item.productId);
        productSalesMap[item.productId] = {
          name: item.productName,
          qty: 0,
          total: 0,
          image: prod?.image,
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].total += item.totalPrice;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 font-semibold text-xs rounded-full border border-teal-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Pureza Business Overview
          </span>
          <h1
            style={{ fontFamily: "'Anek Bangla', 'Tiro Bangla', 'Hind Siliguri', sans-serif" }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent drop-shadow-xs py-1"
          >
            স্বাগতম, পিউরেজা বিজনেস প্যানেলে!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            আজকের বিক্রি, পেন্ডিং অর্ডার ও স্টক আপডেট দেখুন। সব কার্যক্রম রিয়েলটাইমে আপডেট হচ্ছে।
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('new-order')}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন অর্ডার নিন
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>AI রিপোর্ট নিন 🤖</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Major Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">আজকের বিক্রি</span>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{todaySales.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> {todayOrders.length} টি অর্ডারের মাধ্যমে
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">এই মাসের বিক্রি</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{monthlySales.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            মোট অর্ডার: {orders.length} টি
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">মাসের মোট খরচ</span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{monthlyExpenses.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-rose-500 font-medium mt-1">
            আজকের খরচ: ৳{todayExpenses.toLocaleString('bn-BD')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">আনুমানিক নিট লাভ</span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            ৳{netProfit.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            (বিক্রি - পণ্য খরচ - পরিচালনা খরচ)
          </p>
        </div>
      </div>

      {/* Order Status Breakdown Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
          অর্ডার স্ট্যাটাস সামারি
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all text-center"
          >
            <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{pendingCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">পেন্ডিং</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition-all text-center"
          >
            <ShoppingCart className="w-5 h-5 mx-auto text-sky-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{processingCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">প্রসেসিং</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400 transition-all text-center"
          >
            <PackageCheck className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{packedCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">প্যাকড</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition-all text-center"
          >
            <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{deliveredCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">ডেলিভার্ড</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-rose-400 transition-all text-center"
          >
            <XCircle className="w-5 h-5 mx-auto text-rose-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{cancelledCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">বাতিল</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-purple-400 transition-all text-center"
          >
            <RotateCcw className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <span className="text-lg font-black text-slate-900 dark:text-white block">{returnedCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">রিটার্নড</span>
          </div>

          <div
            onClick={() => setActiveTab('inventory')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-rose-500 transition-all text-center"
          >
            <AlertTriangle className="w-5 h-5 mx-auto text-rose-600 mb-1" />
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 block">{lowStockProducts.length}</span>
            <span className="text-[11px] text-slate-500 font-medium">কম স্টক</span>
          </div>
        </div>
      </div>

      {/* Main Graph & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Expense SVG Graph (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                মাসিক বিক্রি ও খরচের ট্রেন্ড গ্রাফ
              </h3>
              <p className="text-xs text-slate-500">চলতি মাসের পারফরম্যান্স ভিজ্যুয়ালাইজেশন</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span> বিক্রি
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> খরচ
              </span>
            </div>
          </div>

          {/* Interactive Responsive SVG Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4" />

              {/* Sales Line */}
              <path
                d="M 20 120 Q 100 40, 200 70 T 380 30 T 480 50"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 20 120 Q 100 40, 200 70 T 380 30 T 480 50 L 480 160 L 20 160 Z"
                fill="url(#salesGrad)"
                opacity="0.2"
              />

              {/* Expense Line */}
              <path
                d="M 20 150 Q 100 130, 200 140 T 380 110 T 480 125"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data Points */}
              <circle cx="200" cy="70" r="5" className="fill-teal-600" />
              <circle cx="380" cy="30" r="5" className="fill-teal-600" />
              <circle cx="480" cy="50" r="5" className="fill-teal-600" />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>সপ্তাহ ১</span>
            <span>সপ্তাহ ২</span>
            <span>সপ্তাহ ৩</span>
            <span>সপ্তাহ ৪ (বর্তমান)</span>
          </div>
        </div>

        {/* Top Selling Products List (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                সেরা বিক্রিত পণ্য
              </h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                সব দেখুন
              </button>
            </div>

            <div className="space-y-3">
              {topSellingProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">এখনো কোনো বিক্রি হয়নি</p>
              ) : (
                topSellingProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-3 gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400 m-2.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">বিক্রি: {p.qty} টি</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-teal-700 dark:text-teal-400">
                      ৳{p.total.toLocaleString('bn-BD')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center">
            <span className="text-xs text-slate-400">মোট নিবন্ধিত পণ্য: {products.length} টি</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> স্টক শেষ হওয়ার অ্যালার্ট
            </h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              ইনভেন্টরি খুলুন →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2">পণ্য</th>
                  <th className="py-2 text-center">বর্তমান স্টক</th>
                  <th className="py-2 text-center">মিনিমাম</th>
                  <th className="py-2 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      পর্যাপ্ত স্টক রয়েছে! কোনো সতর্কবার্তা নেই।
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{prod.name}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          {prod.currentStock} টি
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-slate-400">{prod.minStock} টি</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => adjustStock(prod.id, 'Stock In', 20, 'ড্যাশবোর্ড কুইক রিস্পন্স স্টক ইন')}
                          className="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-[11px] font-bold rounded-lg hover:bg-teal-100 cursor-pointer"
                        >
                          +২০ স্টক ইন
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              সাম্প্রতিক অর্ডারসমূহ
            </h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              সকল অর্ডার ({orders.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {order.customerName} | {order.district}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-xs text-teal-700 dark:text-teal-400 block">
                    ৳{order.grandTotal.toLocaleString('bn-BD')}
                  </span>
                  <button
                    onClick={() => openInvoiceModal(order)}
                    className="text-[11px] text-slate-500 hover:text-teal-600 font-semibold flex items-center gap-1 justify-end mt-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" /> প্রিন্ট
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
