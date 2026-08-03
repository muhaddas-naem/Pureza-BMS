import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Edit2,
  Tags,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  PieChart,
  FileText,
  Upload,
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Paperclip,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Building,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense, PaymentMethod, ExpenseStatus, ExpenseType, ExpenseHistoryItem } from '../types';

export const ExpensesView: React.FC = () => {
  const { expenses, expenseCategories, orders, addExpense, updateExpense, deleteExpense, setActiveTab, currentUser } = useApp();

  // Sub-tabs state
  const [subTab, setSubTab] = useState<'list' | 'cashbook' | 'cashflow' | 'analytics'>('list');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [timelineExpense, setTimelineExpense] = useState<Expense | null>(null);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMethod, setFilterMethod] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]?.name || 'অফিস খরচ');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser?.name || 'এডমিন');
  const [status, setStatus] = useState<ExpenseStatus>('Paid');
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');

  // -------------------------------------------------------------
  // CALCULATIONS (Today, Weekly, Monthly, Yearly, Profits, Cash)
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Today's Expense
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Weekly Expense (Last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyExpenses = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const weeklyExpenseTotal = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Monthly Expense
  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyExpenseTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Yearly Expense
  const yearlyExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear);
  const yearlyExpenseTotal = yearlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Total Expenses (All time)
  const totalExpenseAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Revenue & Order Profit Calculations
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  
  // Cost of Goods Sold (COGS)
  const totalCOGS = deliveredOrders.reduce((sum, o) => {
    const orderCOGS = o.items.reduce((itemSum, item) => itemSum + item.buyingPrice * item.quantity, 0);
    return sum + orderCOGS;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;

  // Operating Costs (Salaries, Office, Utility, Marketing, Packaging, Courier)
  const operatingExpenseCategories = [
    'ডিজিটাল মার্কেটিং ও এডস',
    'অফিস পরিচালনা খরচ (Office Expenses)',
    'কর্মীদের বেতন (Salary Expenses)',
    'ইউটিলিটি ও বিল (Utility Bills)',
    'প্যাকেজিং উপাদান (Packaging Cost)',
    'কুরিয়ার ও ডেলিভারি চার্জ',
    'অফিস খরচ',
    'ফেসবুক এডস',
    'কর্মীদের বেতন',
    'ইন্টারনেট ও বিল',
  ];

  const operatingCost = expenses
    .filter((e) => operatingExpenseCategories.includes(e.category || e.categoryName || ''))
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = grossProfit - totalExpenseAllTime;

  // Cash Balance Calculation (Inflows vs Outflows)
  const cashIncomeFromOrders = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const cashExpenses = expenses
    .filter((e) => e.status !== 'Cancelled')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCashBalance = Math.max(0, 150000 + cashIncomeFromOrders - cashExpenses);

  // Wallet breakdowns
  const bKashBalance = Math.round(totalCashBalance * 0.4);
  const cashInHand = Math.round(totalCashBalance * 0.25);
  const bankBalance = Math.round(totalCashBalance * 0.25);
  const nagadRocketBalance = Math.round(totalCashBalance * 0.1);

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (!e) return false;
    const expCatName = e.category || e.categoryName || '';
    const expTitle = e.title || e.description || '';
    const expPaidBy = e.paidBy || e.createdBy || 'এডমিন';
    const expMethod = e.paymentMethod || 'Cash';
    const expStatus = e.status || 'Paid';

    const matchesCategory = filterCategory === 'All' || expCatName === filterCategory;
    const matchesMethod = filterMethod === 'All' || expMethod === filterMethod;
    const matchesStatus = filterStatus === 'All' || expStatus === filterStatus;
    const matchesSearch =
      expTitle.toLowerCase().includes(search.toLowerCase()) ||
      expCatName.toLowerCase().includes(search.toLowerCase()) ||
      expPaidBy.toLowerCase().includes(search.toLowerCase()) ||
      (e.expenseNumber && e.expenseNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.referenceNumber && e.referenceNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesMethod && matchesStatus && matchesSearch;
  });

  // Modal handlers
  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory(expenseCategories[0]?.name || 'অফিস খরচ');
    setAmount(1000);
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setReferenceNumber(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaidBy(currentUser?.name || 'এডমিন');
    setStatus('Paid');
    setNotes('');
    setAttachmentName('');
    setAttachmentUrl('');
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title || exp.description || '');
    setCategory(exp.category || exp.categoryName || expenseCategories[0]?.name || 'অফিস খরচ');
    setAmount(exp.amount || 0);
    setDate(exp.date || new Date().toISOString().split('T')[0]);
    setPaymentMethod(exp.paymentMethod || 'Cash');
    setReferenceNumber(exp.referenceNumber || '');
    setPaidBy(exp.paidBy || exp.createdBy || 'এডমিন');
    setStatus(exp.status || 'Paid');
    setNotes(exp.notes || '');
    setAttachmentName(exp.attachmentName || '');
    setAttachmentUrl(exp.attachmentUrl || '');
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const timestamp = new Date().toLocaleString('bn-BD');
    const expNumber = editingExpense?.expenseNumber || `EXP-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingExpense) {
      const existingHistory: ExpenseHistoryItem[] = editingExpense.history || [];
      const updatedHistory: ExpenseHistoryItem[] = [
        ...existingHistory,
        {
          timestamp,
          action: 'Expense Edited',
          user: currentUser?.name || paidBy || 'এডমিন',
          notes: `পরিমাণ: ৳${amount}, খাত: ${category}`,
        },
      ];

      updateExpense({
        ...editingExpense,
        expenseNumber: expNumber,
        referenceNumber,
        title: title.trim(),
        category,
        categoryName: category,
        amount,
        date,
        paymentMethod,
        paidBy,
        createdBy: editingExpense.createdBy || paidBy,
        status,
        notes,
        attachmentName,
        attachmentUrl,
        history: updatedHistory,
      });
    } else {
      const initialHistory: ExpenseHistoryItem[] = [
        {
          timestamp,
          action: 'Expense Created',
          user: currentUser?.name || paidBy || 'এডমিন',
          notes: 'নতুন ভাউচার এন্ট্রি করা হয়েছে',
        },
      ];

      addExpense({
        expenseNumber: expNumber,
        referenceNumber,
        title: title.trim(),
        category,
        categoryName: category,
        amount,
        date,
        paymentMethod,
        paidBy,
        createdBy: currentUser?.name || paidBy,
        status,
        notes,
        attachmentName,
        attachmentUrl,
        type: 'Expense',
        history: initialHistory,
      });
    }

    setModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Module Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                ইআরপি হিসাব ও এক্সপেন্স ম্যানেজমেন্ট (ERP Accounting)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ব্যবসার যাবতীয় ক্যাশ বুক, ইনকাম-এক্সপেন্স, ভাউচার ও প্রফিট/লস ট্র্যাকার
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('expense-categories')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Tags className="w-4 h-4 text-amber-500" /> খরচের ক্যাটাগরি
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন খরচের ভাউচার যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today's Expense */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">আজকের খরচ</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-base font-black text-rose-600 dark:text-rose-400">
            ৳{todayExpenseTotal.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">আজকের {todayExpenses.length} টি ভাউচার</span>
        </div>

        {/* Monthly Expense */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">চলতি মাসের খরচ</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-black text-amber-600 dark:text-amber-400">
            ৳{monthlyExpenseTotal.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">{monthlyExpenses.length} টি মোট ভাউচার</span>
        </div>

        {/* Operating Cost */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">অপারেটিং কস্ট</span>
            <Building className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-base font-black text-sky-600 dark:text-sky-400">
            ৳{operatingCost.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">অফিস + বেতন + এডস</span>
        </div>

        {/* Gross Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">গ্রস প্রফিট (Gross)</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
            ৳{grossProfit.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">সেলস - প্রোডাক্ট কেনা খরচ</span>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">নিট প্রফিট (Net)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-base font-black ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            ৳{netProfit.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">সকল খরচ বাদ দেওয়ার পর</span>
        </div>

        {/* Cash Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold text-slate-500">ক্যাশ ও ওয়ালেট ব্যালেন্স</span>
            <Wallet className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-base font-black text-teal-600 dark:text-teal-400">
            ৳{totalCashBalance.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">ক্যাশ ইন হ্যান্ড ও ওয়ালেট</span>
        </div>
      </div>

      {/* Accounting Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setSubTab('list')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'list'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> খরচের তালিকা ও ভাউচার
        </button>

        <button
          onClick={() => setSubTab('cashbook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'cashbook'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpenIcon className="w-4 h-4" /> দৈনিক ক্যাশ বুক ও পেটি ক্যাশ
        </button>

        <button
          onClick={() => setSubTab('cashflow')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'cashflow'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" /> ক্যাশ ফ্লো ও ফান্ড অ্যাকাউন্টস
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'analytics'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" /> প্রফিট ও লস অ্যানালিটিক্স
        </button>
      </div>

      {/* SUB-TAB 1: EXPENSES LIST & SEARCH */}
      {subTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ভাউচার নম্বর, খরচের বিবরণ, রেফারেন্স বা প্রদানকারী দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">সকল খরচের খাত (All)</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="w-full lg:w-40">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">সকল পেমেন্ট মেথড</option>
                <option value="Cash">Cash (নগদ)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Card">Visa/Master Card</option>

                <option value="Cheque">Cheque (চেক)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-36">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">সকল স্ট্যাটাস</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ভাউচার / তারিখ</th>
                    <th className="py-3 px-4">খাত (Category)</th>
                    <th className="py-3 px-4">বিবরণ ও রেফারেন্স</th>
                    <th className="py-3 px-4">পেমেন্ট মেথড</th>
                    <th className="py-3 px-4 text-right">পরিমাণ (৳)</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4">প্রদানকারী</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        কোনো খরচের রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                            {exp.expenseNumber || `EXP-${exp.id}`}
                          </span>
                          <span className="text-[10px] text-slate-400">{exp.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[11px]">
                            {exp.category || exp.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                          <p className="font-bold">{exp.title || exp.description || 'খরচের বিবরণ'}</p>
                          {exp.referenceNumber && (
                            <p className="text-[10px] text-slate-400 font-mono">Ref: {exp.referenceNumber}</p>
                          )}
                          {exp.notes && <p className="text-[10px] text-slate-400 truncate">{exp.notes}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            {exp.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                          ৳{(exp.amount || 0).toLocaleString('bn-BD')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exp.status === 'Paid'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : exp.status === 'Pending'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : exp.status === 'Approved'
                                ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {exp.status || 'Paid'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{exp.paidBy || exp.createdBy || 'এডমিন'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setTimelineExpense(exp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                              title="টাইমলাইন ও হিস্ট্রি"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(exp)}
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg cursor-pointer transition-colors"
                              title="সম্পাদনা"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingExpense(exp)}
                              className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer transition-colors"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DAILY CASH BOOK & PETTY CASH */}
      {subTab === 'cashbook' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" /> দৈনিক ক্যাশ বুক রেজিস্টার (Daily Cash Book)
                </h3>
                <p className="text-xs text-slate-500">প্রতিদিনের মোট ক্যাশ ইন (আয়) ও ক্যাশ আউট (ব্যয়) এর রিয়েলটাইম রেকর্ড</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">আজকের ক্লোজিং ক্যাশ ব্যালেন্স</span>
                <span className="text-lg font-black text-emerald-600">৳{totalCashBalance.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Cashbook entries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash In Flow */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" /> ক্যাশ ইন (Cash Receipts / Inflows)
                  </h4>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    ৳{cashIncomeFromOrders.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">কাস্টমার অর্ডার পেমেন্ট রিসিভ</p>
                      <p className="text-[10px] text-slate-400">bKash, Nagad ও ক্যাশ অন ডেলিভারি ಸಂಗ্রহ</p>
                    </div>
                    <span className="font-bold text-emerald-600">+৳{cashIncomeFromOrders.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">প্রারম্ভিক ক্যাশ ফান্ড (Opening Reserve)</p>
                      <p className="text-[10px] text-slate-400">ব্যবসায়িক রানিং ক্যাশ ব্যালেন্স</p>
                    </div>
                    <span className="font-bold text-emerald-600">+৳1,50,000</span>
                  </div>
                </div>
              </div>

              {/* Cash Out Flow & Petty Cash */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-600" /> ক্যাশ আউট ও পেটি ক্যাশ (Outflows & Petty Cash)
                  </h4>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                    -৳{cashExpenses.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {expenses.slice(0, 4).map((e) => (
                    <div key={e.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{e.title}</p>
                        <p className="text-[10px] text-slate-400">{e.paymentMethod} | {e.date}</p>
                      </div>
                      <span className="font-bold text-rose-600">-৳{e.amount.toLocaleString('bn-BD')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CASH FLOW & WALLETS */}
      {subTab === 'cashflow' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cash in Hand */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">ক্যাশ ইন হ্যান্ড (Cash Box)</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">৳{cashInHand.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-slate-400 font-medium">অফিস ক্যাশ ড্রয়ার ও পেটি ক্যাশ বাক্সে সংরক্ষিত নগদ অর্থ</p>
          </div>

          {/* bKash Merchant Wallet */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">bKash Merchant Account</span>
              <div className="p-2 bg-pink-100 dark:bg-pink-950 text-pink-600 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-pink-600">৳{bKashBalance.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-slate-400 font-medium">বিকাশ মার্চেন্ট ওয়ালেট রানিং ব্যালেন্স</p>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">ব্যাংক অ্যাকাউন্টস (City Bank)</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-indigo-600">৳{bankBalance.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-slate-400 font-medium">ব্যবসায়িক কারেন্ট অ্যাকাউন্ট ব্যালেন্স</p>
          </div>

          {/* Nagad / Rocket */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">নগদ ও রকেট ওয়ালেট</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600">৳{nagadRocketBalance.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-slate-400 font-medium">মোবাইল ফাইনান্সিয়াল ওয়ালেট ব্যালেন্স</p>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FINANCIAL P&L ANALYTICS */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <PieChart className="w-5 h-5 text-indigo-600" /> প্রফিট এন্ড লস (Profit & Loss Statement)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Income & Revenue Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b pb-1">
                  মোট আয় (Revenue & Income)
                </h4>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span>ডেলিভার্ড অর্ডার থেকে আয় (Delivered Sales Revenue)</span>
                  <span className="font-bold text-emerald-600">৳{totalRevenue.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span>অন্যান্য প্রাপ্তি / সার্ভিস ইনকাম</span>
                  <span className="font-bold text-emerald-600">৳0</span>
                </div>
                <div className="flex justify-between p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-xl font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  <span>সর্বমোট আয় (Total Inflows)</span>
                  <span>৳{totalRevenue.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              {/* Expense & Cost Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b pb-1">
                  মোট খরচ ও ব্যয় (Expenses & Costs)
                </h4>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span>পণ্য ক্রয়ের খরচ (Cost of Goods Sold - COGS)</span>
                  <span className="font-bold text-rose-600">৳{totalCOGS.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span>ব্যবসার সকল অপারেটিং ও সাধারণ খরচ</span>
                  <span className="font-bold text-rose-600">৳{totalExpenseAllTime.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between p-3 bg-rose-100 dark:bg-rose-950/80 rounded-xl font-bold text-rose-900 dark:text-rose-200 text-sm">
                  <span>সর্বমোট ব্যয় (Total Outflows)</span>
                  <span>৳{(totalCOGS + totalExpenseAllTime).toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            {/* Net Calculation Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-indigo-200 font-semibold block">চুড়ান্ত নিট প্রফিট / লস (Net Operating Profit)</span>
                <p className="text-2xl font-black">
                  ৳{netProfit.toLocaleString('bn-BD')}{' '}
                  <span className="text-xs font-normal text-emerald-400">({netProfit >= 0 ? 'লাভজনক' : 'ক্ষতি'})</span>
                </p>
              </div>
              <div className="flex gap-4 text-xs text-indigo-100">
                <div className="text-right">
                  <span className="block text-indigo-300">গ্রস প্রফিট মার্জিন</span>
                  <span className="font-bold text-white">
                    {totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0}%
                  </span>
                </div>
                <div className="text-right border-l border-indigo-800 pl-4">
                  <span className="block text-indigo-300">নিট প্রফিট মার্জিন</span>
                  <span className="font-bold text-emerald-400">
                    {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              {editingExpense ? 'খরচের হিসাব ও ভাউচার আপডেট' : 'নতুন ইআরপি খরচের ভাউচার এন্ট্রি'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">খরচের খাত (Category) *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">পেমেন্ট মেথড (Payment Method) *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (রকেট)</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Card">Visa / Master Card</option>
                    <option value="Cheque">Cheque (চেক)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">খরচের মূল শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ফেসবুক এডস বুস্টিং ডলার কার্ড পেমেন্ট"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-rose-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">স্ট্যাটাস (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">রেফারেন্স বা ভাউচার নম্বর (Ref No)</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="যেমন: bKash TrxID বা Cheque No"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">প্রদানকারী / স্পেন্ডার (Paid By)</label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* File Attachment Upload */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  সংযুক্ত ভাউচার / রসিদের ছবি বা পিডিএফ (Attachment)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 cursor-pointer font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Upload className="w-4 h-4 text-slate-500" /> ফাইল সিলেক্ট করুন
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                  </label>
                  {attachmentName && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> {attachmentName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">অতিরিক্ত নোট বা মেমো (Notes)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="খরচ সম্পর্কিত যেকোনো বিশেষ তথ্য লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingExpense ? 'ভাউচার আপডেট করুন' : 'ভাউচার সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE / AUDIT LOG MODAL */}
      {timelineExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> খরচের অডিট টাইমলাইন (Audit Log)
              </h3>
              <button
                onClick={() => setTimelineExpense(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">{timelineExpense.title}</p>
              <p className="text-slate-500 font-mono">
                ভাউচার: {timelineExpense.expenseNumber || timelineExpense.id} | পরিমাণ: ৳{timelineExpense.amount}
              </p>
            </div>

            {/* History Items */}
            <div className="space-y-3 text-xs max-h-60 overflow-y-auto pr-1">
              {(timelineExpense.history || [
                {
                  timestamp: timelineExpense.createdAt || 'অতীত রেকর্ড',
                  action: 'Expense Created',
                  user: timelineExpense.paidBy || timelineExpense.createdBy || 'System',
                },
              ]).map((h, i) => (
                <div key={i} className="flex items-start gap-3 border-l-2 border-indigo-500 pl-3 py-1">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{h.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {h.user} • {h.timestamp}
                    </span>
                    {h.notes && <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>

            {timelineExpense.attachmentName && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-indigo-600" /> {timelineExpense.attachmentName}
                </span>
                <span className="text-[10px] text-indigo-500 font-bold">সংযুক্ত ডকুমেন্ট</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">খরচের ভাউচার মুছে ফেলুন</h3>
                <p className="text-xs text-slate-500">এই ভাউচারটি স্থায়ীভাবে ডিলিট হয়ে যাবে</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{deletingExpense.title}</p>
              <p className="text-slate-500">খাত: {deletingExpense.category || deletingExpense.categoryName} | পরিমাণ: ৳{deletingExpense.amount}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(deletingExpense.id);
                  setDeletingExpense(null);
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

// Helper Icon Component for BookOpen
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
