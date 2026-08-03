import React, { useState, useMemo } from 'react';
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
  Award,
  Filter,
  Package,
  ShoppingBag,
  Users,
  Percent,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all' | 'custom';
type ReportTab = 'overview' | 'products' | 'categories' | 'couriers' | 'districts' | 'customers';

export const ReportsView: React.FC = () => {
  const { orders, expenses, products, customers } = useApp();

  // State
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Filter Orders & Expenses based on Selected Date Range
  const filteredData = useMemo(() => {
    const now = new Date();

    let start = new Date(0); // Epoch
    let end = new Date(2099, 11, 31);

    if (datePreset === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (datePreset === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      start = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 0, 0, 0);
      end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 23, 59, 59);
    } else if (datePreset === 'last7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      start = new Date(d7.getFullYear(), d7.getMonth(), d7.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (datePreset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (datePreset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (datePreset === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (datePreset === 'custom' && customStartDate && customEndDate) {
      start = new Date(`${customStartDate}T00:00:00`);
      end = new Date(`${customEndDate}T23:59:59`);
    }

    const filteredOrders = orders.filter((o) => {
      const oDate = new Date(o.createdAt || o.orderDate || Date.now());
      if (isNaN(oDate.getTime())) return true;
      return oDate >= start && oDate <= end;
    });

    const filteredExpenses = expenses.filter((e) => {
      const eDate = new Date(e.expenseDate || e.createdAt || Date.now());
      if (isNaN(eDate.getTime())) return true;
      return eDate >= start && eDate <= end;
    });

    return { filteredOrders, filteredExpenses };
  }, [orders, expenses, datePreset, customStartDate, customEndDate]);

  const { filteredOrders, filteredExpenses } = filteredData;

  // Status classification helpers
  const isSalesRecognized = (st: OrderStatus) =>
    st === 'Confirmed' ||
    st === 'Invoice Generated' ||
    st === 'Processing' ||
    st === 'Packed' ||
    st === 'Shipped' ||
    st === 'Delivered' ||
    st === 'Completed';

  const isPending = (st: OrderStatus) => st === 'New';

  const recognizedOrders = filteredOrders.filter((o) => isSalesRecognized(o.orderStatus));
  const pendingOrders = filteredOrders.filter((o) => isPending(o.orderStatus));
  const deliveredOrders = filteredOrders.filter((o) => o.orderStatus === 'Delivered' || o.orderStatus === 'Completed');
  const returnedOrders = filteredOrders.filter((o) => o.orderStatus === 'Returned');
  const cancelledOrders = filteredOrders.filter((o) => o.orderStatus === 'Cancelled');

  // Key Financial Metrics
  const totalSalesRevenue = recognizedOrders.reduce((acc, o) => acc + o.grandTotal, 0);
  const pendingRevenue = pendingOrders.reduce((acc, o) => acc + o.grandTotal, 0);

  const totalCOGS = recognizedOrders.reduce((acc, o) => {
    const itemCost = o.items.reduce((iAcc, item) => iAcc + item.buyingPrice * item.quantity, 0);
    return acc + itemCost;
  }, 0);

  const grossProfit = totalSalesRevenue - totalCOGS;
  const totalOperatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  // Average Order Value (AOV)
  const aov = recognizedOrders.length > 0 ? Math.round(totalSalesRevenue / recognizedOrders.length) : 0;

  // Product Matrix Calculation
  const productStats = useMemo(() => {
    const pMap: {
      [id: string]: {
        id: string;
        name: string;
        sku: string;
        categoryName?: string;
        unitsSold: number;
        revenue: number;
        cogs: number;
        profit: number;
        stock: number;
      };
    } = {};

    recognizedOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!pMap[item.productId]) {
          const matchedP = products.find((p) => p.id === item.productId);
          pMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            sku: matchedP?.sku || item.sku || 'N/A',
            categoryName: matchedP?.categoryName || 'General',
            unitsSold: 0,
            revenue: 0,
            cogs: 0,
            profit: 0,
            stock: matchedP?.currentStock || 0,
          };
        }
        const rev = item.sellingPrice * item.quantity;
        const cost = item.buyingPrice * item.quantity;
        pMap[item.productId].unitsSold += item.quantity;
        pMap[item.productId].revenue += rev;
        pMap[item.productId].cogs += cost;
        pMap[item.productId].profit += rev - cost;
      });
    });

    return Object.values(pMap).sort((a, b) => b.revenue - a.revenue);
  }, [recognizedOrders, products]);

  // Category Breakdown Calculation
  const categoryStats = useMemo(() => {
    const cMap: { [cat: string]: { name: string; revenue: number; unitsSold: number; orderCount: number } } = {};

    productStats.forEach((p) => {
      const cat = p.categoryName || 'General';
      if (!cMap[cat]) {
        cMap[cat] = { name: cat, revenue: 0, unitsSold: 0, orderCount: 0 };
      }
      cMap[cat].revenue += p.revenue;
      cMap[cat].unitsSold += p.unitsSold;
    });

    return Object.values(cMap).sort((a, b) => b.revenue - a.revenue);
  }, [productStats]);

  // Courier Breakdown Calculation
  const courierStats = useMemo(() => {
    const courList = ['Pathao', 'Steadfast', 'RedX', 'Paperfly', 'Sundarban', 'SA Parivahan'];
    return courList
      .map((cour) => {
        const courOrders = filteredOrders.filter((o) => o.courier === cour);
        const totalCount = courOrders.length;
        const deliveredCount = courOrders.filter((o) => o.orderStatus === 'Delivered' || o.orderStatus === 'Completed').length;
        const returnedCount = courOrders.filter((o) => o.orderStatus === 'Returned').length;
        const revenue = courOrders
          .filter((o) => isSalesRecognized(o.orderStatus))
          .reduce((acc, o) => acc + o.grandTotal, 0);

        const successPct =
          deliveredCount + returnedCount > 0
            ? ((deliveredCount / (deliveredCount + returnedCount)) * 100).toFixed(1)
            : '0';

        return {
          courier: cour,
          totalCount,
          deliveredCount,
          returnedCount,
          revenue,
          successPct,
        };
      })
      .filter((c) => courierFilter === 'all' || c.courier === courierFilter || c.totalCount > 0);
  }, [filteredOrders, courierFilter]);

  // District Breakdown Calculation
  const districtStats = useMemo(() => {
    const dMap: { [d: string]: { name: string; count: number; revenue: number } } = {};

    recognizedOrders.forEach((o) => {
      const dist = o.district || 'ঢাকা';
      if (!dMap[dist]) {
        dMap[dist] = { name: dist, count: 0, revenue: 0 };
      }
      dMap[dist].count += 1;
      dMap[dist].revenue += o.grandTotal;
    });

    return Object.values(dMap).sort((a, b) => b.revenue - a.revenue);
  }, [recognizedOrders]);

  // CSV Export Handler
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

    if (activeTab === 'products') {
      csvContent += 'Product Name,SKU,Category,Units Sold,Revenue (BDT),COGS (BDT),Net Profit (BDT)\n';
      productStats.forEach((p) => {
        csvContent += `"${p.name.replace(/"/g, '""')}","${p.sku}","${p.categoryName || ''}",${p.unitsSold},${p.revenue},${p.cogs},${p.profit}\n`;
      });
    } else if (activeTab === 'districts') {
      csvContent += 'District,Orders Count,Total Revenue (BDT)\n';
      districtStats.forEach((d) => {
        csvContent += `"${d.name}",${d.count},${d.revenue}\n`;
      });
    } else {
      csvContent += 'Order Number,Customer Name,District,Courier,Order Status,Grand Total (BDT),Date\n';
      filteredOrders.forEach((o) => {
        csvContent += `"${o.orderNumber}","${o.customerName.replace(/"/g, '""')}","${o.district}","${o.courier}","${o.orderStatus}",${o.grandTotal},"${o.createdAt}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Business_Report_${datePreset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Printable Header - visible only during print */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">ইনভেন্টরি ও সেলস বিজনেস রিপোর্ট</h1>
        <p className="text-xs text-gray-600">তৈরি সময়: {new Date().toLocaleString('bn-BD')}</p>
        <p className="text-xs font-semibold mt-1">
          হিসাবের সময়কাল: {datePreset === 'all' ? 'সর্বমোট' : datePreset}
        </p>
      </div>

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" /> অ্যাডভান্সড বিজনেস অ্যানালিটিক্স ও রিপোর্টস
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              স্বীকৃত সেলস, প্রফিট মার্জিন, কুরিয়ার পারফরম্যান্স ও জেলাভিত্তিক চাহিদার রিয়েল-টাইম পরিসংখ্যান
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="CSV ডাটা ফাইল ডাউনলোড করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV এক্সপোর্ট
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট রিপোর্ট
            </button>
          </div>
        </div>

        {/* Date Filter Quick Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> সময়কাল:
            </span>
            {(
              [
                ['today', 'আজকের'],
                ['yesterday', 'গতকাল'],
                ['last7', 'গত ৭ দিন'],
                ['thisMonth', 'চলতি মাস'],
                ['lastMonth', 'গত মাস'],
                ['thisYear', 'চলতি বছর'],
                ['all', 'সব সময়'],
                ['custom', 'কাস্টম ডেট'],
              ] as [DatePreset, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  datePreset === key
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker inputs */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-white"
              />
              <span className="text-slate-400 font-bold">থেকে</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary Financial Summary Cards (Responsive 1/2/4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Recognized Sales */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">স্বীকৃত বিক্রয় (Recognized)</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/80 rounded-xl text-teal-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{totalSalesRevenue.toLocaleString('bn-BD')}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-teal-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {recognizedOrders.length} টি নিশ্চিত অর্ডার
            </span>
            <span className="text-slate-400 font-mono">AOV: ৳{aov}</span>
          </div>
        </div>

        {/* Card 2: Pending Sales Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">পেন্ডিং রাজস্ব (Pending)</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/80 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600 mt-2">
            ৳{pendingRevenue.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-amber-500 mt-2 font-medium">
            {pendingOrders.length} টি নতুন কাস্টমার অর্ডার
          </p>
        </div>

        {/* Card 3: COGS & Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট ক্রয় ও অফিশিয়াল খরচ</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/80 rounded-xl text-rose-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{(totalCOGS + totalOperatingExpenses).toLocaleString('bn-BD')}
          </h3>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>পণ্য ক্রয়: ৳{totalCOGS.toLocaleString('bn-BD')}</span>
            <span>অন্যান্য খরচ: ৳{totalOperatingExpenses.toLocaleString('bn-BD')}</span>
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">খাঁটি নিট মুনাফা (Net Profit)</span>
            <div className={`p-2 rounded-xl ${netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/80 text-rose-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ৳{netProfit.toLocaleString('bn-BD')}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-2 font-extrabold flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> নিট প্রফিট মার্জিন: {netProfitMargin}%
          </p>
        </div>
      </div>

      {/* Module Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto custom-scrollbar text-xs font-bold">
        {[
          { id: 'overview', label: 'আর্থিক সারসংক্ষেপ', icon: BarChart3 },
          { id: 'products', label: 'পণ্য বিক্রি মেট্রিক্স', icon: Package },
          { id: 'categories', label: 'ক্যাটাগরি বিশ্লেষণ', icon: Layers },
          { id: 'couriers', label: 'কুরিয়ার ডেলিভারি', icon: Truck },
          { id: 'districts', label: 'জেলা সেলস ম্যাপ', icon: MapPin },
          { id: 'customers', label: 'কাস্টমার ইনসাইটস', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Financial Overview Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Detailed Financial Calculation Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-teal-600" /> আয়-ব্যয় ও লভ্যাংশ বিস্তারিত হিসাব বিবরণী
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-slate-700 dark:text-slate-300">১. হিসাবভুক্ত মোট বিক্রয় (Recognized Revenue)</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">৳{totalSalesRevenue.toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                <span className="font-semibold">(-) বিক্রিত পণ্যের ক্রয়মূল্য (COGS)</span>
                <span className="font-black text-sm">৳{totalCOGS.toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-bold">
                <span>(=) গ্রস প্রফিট (Gross Profit)</span>
                <span className="font-black text-base text-teal-600 dark:text-teal-400">৳{grossProfit.toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                <span className="font-semibold">(-) অন্যান্য পরিচালনা / অফিস খরচ (Expenses)</span>
                <span className="font-black text-sm">৳{totalOperatingExpenses.toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <span className="font-black text-sm block">(=) চূড়ান্ত নিট মুনাফা (Net Profit)</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">সকল খরচ বাদ দিয়ে আসল লাভ</span>
                </div>
                <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                  ৳{netProfit.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Order Status Gauge */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <PieChart className="w-4 h-4 text-teal-600" /> অর্ডার স্ট্যাটাস বন্টন ({filteredOrders.length} টি)
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ডেলিভার্ড/সম্পন্ন</span>
                  <span>{deliveredOrders.length} টি ({filteredOrders.length > 0 ? ((deliveredOrders.length / filteredOrders.length) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${filteredOrders.length > 0 ? (deliveredOrders.length / filteredOrders.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-teal-600 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> শিফট/কনফার্মড</span>
                  <span>{recognizedOrders.length - deliveredOrders.length} টি</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{
                      width: `${filteredOrders.length > 0 ? ((recognizedOrders.length - deliveredOrders.length) / filteredOrders.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> পেন্ডিং (নতুন)</span>
                  <span>{pendingOrders.length} টি</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${filteredOrders.length > 0 ? (pendingOrders.length / filteredOrders.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-rose-600 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> রিটার্ন/বাতিল</span>
                  <span>{returnedOrders.length + cancelledOrders.length} টি</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${filteredOrders.length > 0 ? ((returnedOrders.length + cancelledOrders.length) / filteredOrders.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Top Products Matrix */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> সর্বাধিক বিক্রিত পণ্য পারফরম্যান্স মেট্রিক্স
            </h3>
            <span className="text-xs text-slate-400 font-bold">মোট {productStats.length} টি আইটেম সেলস</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">পণ্য & SKU</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3 text-center">বিক্রিত পরিমাণ</th>
                  <th className="p-3 text-right">মোট রেভিনিউ</th>
                  <th className="p-3 text-right">ক্রয় খরচ (COGS)</th>
                  <th className="p-3 text-right">নিট লাভ</th>
                  <th className="p-3 text-center rounded-r-xl">বর্তমান স্টক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {productStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      নির্ধারিত সময়কালে কোনো পণ্য বিক্রি রেকর্ড হয়নি
                    </td>
                  </tr>
                ) : (
                  productStats.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-slate-900 dark:text-white font-bold">{p.name}</p>
                          <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{p.categoryName}</td>
                      <td className="p-3 text-center font-bold text-teal-600">{p.unitsSold} পিস</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">৳{p.revenue.toLocaleString('bn-BD')}</td>
                      <td className="p-3 text-right text-slate-400">৳{p.cogs.toLocaleString('bn-BD')}</td>
                      <td className="p-3 text-right font-black text-emerald-600">৳{p.profit.toLocaleString('bn-BD')}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.stock <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {p.stock} পিস
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Category Breakdown */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs animate-fade-in">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" /> ক্যাটাগরিভিত্তিক সেলস ও পারফরম্যান্স
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryStats.map((c) => {
              const pct = totalSalesRevenue > 0 ? (c.revenue / totalSalesRevenue) * 100 : 0;
              return (
                <div key={c.name} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</span>
                    <span className="font-black text-teal-600 text-sm">৳{c.revenue.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>মোট বিক্রিত পিস: {c.unitsSold}</span>
                    <span>শেয়ার: {pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Courier Performance */}
      {activeTab === 'couriers' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-600" /> কুরিয়ার সার্ভিসেস পারফরম্যান্স ও রিটার্ন অ্যানালিটিক্স
            </h3>

            {/* Courier Filter */}
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              <option value="all">সকল কুরিয়ার</option>
              <option value="Pathao">Pathao Courier</option>
              <option value="Steadfast">Steadfast Courier</option>
              <option value="RedX">RedX Courier</option>
              <option value="Paperfly">Paperfly Courier</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courierStats.map((c) => (
              <div key={c.courier} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal-600" /> {c.courier}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 font-extrabold text-[10px]">
                    সাকসেস: {c.successPct}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">অর্ডার</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.totalCount}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-emerald-500 block font-semibold">ডেলিভার্ড</span>
                    <span className="font-bold text-emerald-600">{c.deliveredCount}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-rose-500 block font-semibold">রিটার্ন</span>
                    <span className="font-bold text-rose-600">{c.returnedCount}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">হিসাবভুক্ত মূল্য:</span>
                  <span className="font-black text-teal-600">৳{c.revenue.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: District Breakdown */}
      {activeTab === 'districts' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs animate-fade-in">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" /> বাংলাদেশ ৬৪ জেলা সেলস ডিসট্রিবিউশন
          </h3>

          <div className="space-y-3">
            {districtStats.map((d, index) => {
              const pct = totalSalesRevenue > 0 ? (d.revenue / totalSalesRevenue) * 100 : 0;
              return (
                <div key={d.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <strong>{d.name}</strong> ({d.count} টি অর্ডার)
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      ৳{d.revenue.toLocaleString('bn-BD')} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Customer Insights */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs animate-fade-in">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> কাস্টমার ইনসাইটস ও রিপিট পারচেজ অ্যানালিটিক্স
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block">মোট নিবন্ধিত কাস্টমার</span>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{customers.length} জন</h4>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block">এভারেজ অর্ডার ভ্যালু (AOV)</span>
              <h4 className="text-2xl font-black text-teal-600 mt-1">৳{aov}</h4>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block">রিটার্নিং কাস্টমার সংখ্যা</span>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">
                {customers.filter((c) => c.totalOrders > 1).length} জন
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
