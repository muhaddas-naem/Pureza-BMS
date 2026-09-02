import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Calendar,
  Edit2,
  FileText,
  UserCheck,
  Trash2,
  X,
  MessageSquare,
  Award,
  ExternalLink,
  Receipt,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Clock3,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Star,
  Sparkles,
  PhoneCall,
  Send,
  Truck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bdDistricts } from '../data/mockData';
import { Customer, Order } from '../types';
import { DistrictSearchSelect } from '../components/DistrictSearchSelect';
import { ThanaSearchSelect } from '../components/ThanaSearchSelect';

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    orders,
    setActiveTab,
    setSearchTerm,
    openInvoiceModal,
    initiateOrderForCustomer,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('সকল জেলা');
  const [tierFilter, setTierFilter] = useState<'all' | 'vip' | 'regular' | 'new' | 'risk'>('all');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent' | 'deliveryRate'>('spent');

  // Customer Edit/Add Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Dedicated Customer Profile Drawer/Modal State
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'orders' | 'favorites' | 'notes' | 'info'>('orders');
  const [customerNoteText, setCustomerNoteText] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [copiedToast, setCopiedToast] = useState('');
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const triggerToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(''), 2500);
  };

  // Calculate customer order & commerce health stats helper
  const getCustomerStats = (custPhone: string) => {
    const cleanPhone = custPhone.trim();
    const custOrders = orders.filter(
      (o) =>
        o.customerPhone.trim() === cleanPhone ||
        (cleanPhone.length >= 8 && o.customerPhone.endsWith(cleanPhone))
    );

    const completedOrders = custOrders.filter(
      (o) =>
        o.orderStatus === 'Shipped' ||
        o.orderStatus === 'Delivered' ||
        o.orderStatus === 'Completed'
    );
    const returnedOrders = custOrders.filter(
      (o) => o.orderStatus === 'Returned' || o.orderStatus === 'Cancelled'
    );
    const pendingOrders = custOrders.filter(
      (o) =>
        o.orderStatus === 'New' ||
        o.orderStatus === 'Confirmed' ||
        o.orderStatus === 'Invoice Generated' ||
        o.orderStatus === 'Processing' ||
        o.orderStatus === 'Packed'
    );

    const totalSpent = completedOrders.reduce((acc, o) => acc + (Number(o.grandTotal) || 0), 0);
    const totalAllOrdersSpent = custOrders.reduce((acc, o) => acc + (Number(o.grandTotal) || 0), 0);

    // Delivery Success Rate
    const totalFinished = completedOrders.length + returnedOrders.length;
    const deliverySuccessRate =
      totalFinished > 0
        ? Math.round((completedOrders.length / totalFinished) * 100)
        : custOrders.length > 0
        ? 100
        : 0;

    let trustLevel: 'high' | 'normal' | 'risk' | 'new' = 'new';
    if (custOrders.length === 0) {
      trustLevel = 'new';
    } else if (returnedOrders.length >= 2 || (totalFinished >= 2 && deliverySuccessRate < 60)) {
      trustLevel = 'risk';
    } else if (completedOrders.length >= 2 || deliverySuccessRate >= 80) {
      trustLevel = 'high';
    } else {
      trustLevel = 'normal';
    }

    let tier: 'VIP' | 'Regular' | 'New' | 'Risk' = 'New';
    if (trustLevel === 'risk') {
      tier = 'Risk';
    } else if (totalSpent >= 10000 || custOrders.length >= 5) {
      tier = 'VIP';
    } else if (totalSpent >= 3000 || custOrders.length >= 2) {
      tier = 'Regular';
    }

    // Preferred courier calculation
    const courierCounts: Record<string, number> = {};
    custOrders.forEach((o) => {
      if (o.courier) {
        courierCounts[o.courier] = (courierCounts[o.courier] || 0) + 1;
      }
    });
    let preferredCourier = 'Steadfast';
    let maxCount = 0;
    Object.entries(courierCounts).forEach(([cName, count]) => {
      if (count > maxCount) {
        maxCount = count;
        preferredCourier = cName;
      }
    });

    // Top purchased products summary
    const productSummary: Record<
      string,
      { productId: string; name: string; totalQty: number; totalSpent: number; lastDate: string }
    > = {};
    custOrders.forEach((ord) => {
      (ord.items || []).forEach((it) => {
        const pId = it.productId || it.productName;
        if (!productSummary[pId]) {
          productSummary[pId] = {
            productId: it.productId,
            name: it.productName,
            totalQty: 0,
            totalSpent: 0,
            lastDate: ord.date,
          };
        }
        productSummary[pId].totalQty += Number(it.quantity) || 1;
        productSummary[pId].totalSpent +=
          Number(it.totalPrice) ||
          (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1) ||
          0;
      });
    });

    const topProducts = Object.values(productSummary).sort((a, b) => b.totalQty - a.totalQty);

    return {
      custOrders,
      completedOrders,
      returnedOrders,
      pendingOrders,
      totalSpent: totalSpent || totalAllOrdersSpent,
      tier,
      trustLevel,
      deliverySuccessRate,
      preferredCourier,
      topProducts,
      avgOrder:
        custOrders.length > 0
          ? (totalSpent || totalAllOrdersSpent) / custOrders.length
          : 0,
    };
  };

  // Filter & Sort Logic
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.altPhone && c.altPhone.includes(search)) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());

    const matchDistrict = selectedDistrict === 'সকল জেলা' || c.district === selectedDistrict;

    const stats = getCustomerStats(c.phone);
    let matchTier = true;
    if (tierFilter === 'vip') matchTier = stats.tier === 'VIP';
    if (tierFilter === 'regular') matchTier = stats.tier === 'Regular';
    if (tierFilter === 'new') matchTier = stats.tier === 'New';
    if (tierFilter === 'risk') matchTier = stats.trustLevel === 'risk';

    return matchSearch && matchDistrict && matchTier;
  });

  // Sorting
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const statsA = getCustomerStats(a.phone);
    const statsB = getCustomerStats(b.phone);

    if (sortBy === 'spent') {
      return statsB.totalSpent - statsA.totalSpent;
    } else if (sortBy === 'orders') {
      return statsB.custOrders.length - statsA.custOrders.length;
    } else if (sortBy === 'deliveryRate') {
      return statsB.deliverySuccessRate - statsA.deliverySuccessRate;
    } else {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  // Top Metrics
  const totalCustomerSpent = customers.reduce((acc, c) => {
    const stats = getCustomerStats(c.phone);
    return acc + stats.totalSpent;
  }, 0);

  const vipCustomersCount = customers.filter((c) => getCustomerStats(c.phone).tier === 'VIP').length;
  
  const totalOrdersCount = customers.reduce((acc, c) => {
    const stats = getCustomerStats(c.phone);
    return acc + stats.custOrders.length;
  }, 0) || orders.length;

  const avgOrderValue =
    totalOrdersCount > 0 ? Math.round(totalCustomerSpent / totalOrdersCount) : 0;

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAltPhone('');
    setDistrict('ঢাকা');
    setArea('');
    setAddress('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAltPhone(c.altPhone || '');
    setDistrict(c.district);
    setArea(c.area || '');
    setAddress(c.address);
    setNotes(c.notes || '');
    setModalOpen(true);
  };

  const openCustomerProfile = (c: Customer) => {
    setViewingCustomer(c);
    setCustomerNoteText(c.notes || '');
    setActiveProfileTab('orders');
    setNoteSavedFeedback(false);
    setShowWhatsAppMenu(false);
  };

  const handleSaveCustomerNote = (customText?: string) => {
    if (!viewingCustomer) return;
    const finalNote = customText !== undefined ? customText : customerNoteText;
    updateCustomer({
      ...viewingCustomer,
      notes: finalNote,
    });
    setViewingCustomer({
      ...viewingCustomer,
      notes: finalNote,
    });
    setCustomerNoteText(finalNote);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const handleAddQuickTag = (tag: string) => {
    const current = customerNoteText ? `${customerNoteText} | ${tag}` : tag;
    handleSaveCustomerNote(current);
    triggerToast(`ট্যাগ "${tag}" যুক্ত ও সেভ হয়েছে!`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name,
        phone,
        altPhone,
        district,
        area,
        address,
        notes,
      });
      if (viewingCustomer && viewingCustomer.id === editingCustomer.id) {
        setViewingCustomer({
          ...viewingCustomer,
          name,
          phone,
          altPhone,
          district,
          area,
          address,
          notes,
        });
      }
    } else {
      addCustomer({
        name,
        phone,
        altPhone,
        district,
        area,
        address,
        notes,
      });
    }
    setModalOpen(false);
  };

  // WhatsApp Messaging Link Generator
  const getWhatsAppUrl = (cust: Customer, templateType: 'confirm' | 'tracking' | 'offer' | 'address') => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const stats = getCustomerStats(cust.phone);
    const latestOrder = stats.custOrders[0];

    let text = '';
    if (templateType === 'confirm') {
      text = `প্রিয় ${cust.name} ম্যাম/স্যার, Pureza Natural Skincare থেকে আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে। ধন্যবাদ!`;
    } else if (templateType === 'tracking') {
      text = `প্রিয় ${cust.name}, আপনার Pureza Skincare পার্সেলটি ${stats.preferredCourier || 'স্টিডফাস্ট'} কুরিয়ারে বুকিং হয়েছে${
        latestOrder?.trackingNumber ? ` (ট্র্যাকিং আইডি: ${latestOrder.trackingNumber})` : ''
      }। খুব শীঘ্রই ডেলিভারি পাবেন।`;
    } else if (templateType === 'offer') {
      text = `প্রিয় ${cust.name}, আমাদের সম্মানিত কাস্টমার হিসেবে Pureza Natural Skincare-এ আপনার পরবর্তী কেনাকাটায় স্পেশাল লয়ালটি গিফট রয়েছে! আমাদের নতুন প্রডাক্ট কালেকশন দেখতে যোগাযোগ করুন।`;
    } else {
      text = `প্রিয় ${cust.name}, আপনার ডেলিভারি ঠিকানা: ${cust.address}, ${cust.district}। পার্সেল ডেলিভারির পূর্বে তথ্য যাচাইয়ের জন্য যোগাযোগ করা হলো।`;
    }

    return `https://wa.me/88${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} সফলভাবে কপি হয়েছে!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Copied Toast Banner */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce border border-teal-500/40">
          <Check className="w-4 h-4 text-teal-400 dark:text-teal-600" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Top Header & Stats Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-teal-600" />
              কাস্টমার ডিরেক্টরি ও কমার্স প্রোফাইল
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              কাস্টমারের পারচেজ হিস্ট্রি, ডেলিভারি ট্রাস্ট রেট, ১-ক্লিক নতুন অর্ডার ও মেসেজিং পোর্টাল
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কাস্টমার নিবন্ধন</span>
          </button>
        </div>

        {/* Overview Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-teal-50/50 dark:bg-teal-950/30 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-900/40">
            <span className="text-[10px] font-extrabold text-teal-800 dark:text-teal-300 block uppercase tracking-wider">
              মোট কাস্টমার
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {customers.length} <span className="text-xs font-normal text-slate-400">জন</span>
            </span>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">
              মোট কাস্টমার সেলস (LTV)
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{totalCustomerSpent.toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
            <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
              VIP ক্লায়েন্ট (৳১০k+)
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {vipCustomersCount} <span className="text-xs font-normal text-slate-400">জন</span>
            </span>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-extrabold text-blue-800 dark:text-blue-300 block uppercase tracking-wider">
              গড় অর্ডার মূল্য (AOV)
            </span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              ৳{avgOrderValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাস্টমারের নাম, মোবাইল নম্বর, জেলা বা ডেলিভারি ঠিকানা..."
              className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              <option value="vip">⭐ VIP ক্লায়েন্ট (৳১০k+)</option>
              <option value="regular">💎 রেগুলার বায়ার (৳৩k+)</option>
              <option value="new">🌱 নতুন বায়ার</option>
              <option value="risk">⚠️ রিটার্ন ঝুঁকিযুক্ত</option>
            </select>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 cursor-pointer max-w-[150px]"
            >
              <option value="সকল জেলা">সকল জেলা</option>
              {bdDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="spent">সর্ট: সর্বোচ্চ বিক্রয় (LTV)</option>
              <option value="orders">সর্ট: মোট অর্ডার সংখ্যা</option>
              <option value="deliveryRate">সর্ট: ডেলিভারি সাকসেস রেট</option>
              <option value="recent">সর্ট: নতুন কাস্টমার</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List Grid */}
      {sortedCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto stroke-1" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">কোনো কাস্টমার পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400">অনুগ্রহ করে ফিল্টার পরিবর্তন করে চেষ্টা করুন বা নতুন কাস্টমার যুক্ত করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCustomers.map((cust) => {
            const stats = getCustomerStats(cust.phone);

            return (
              <div
                key={cust.id}
                onClick={() => openCustomerProfile(cust)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  {/* Top Customer Avatar, Name & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors flex items-center gap-1.5 flex-wrap">
                          {cust.name}
                          {stats.tier === 'VIP' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              ⭐ VIP
                            </span>
                          )}
                          {stats.tier === 'Regular' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              💎 Regular
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {cust.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditModal(cust, e)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="প্রোফাইল সংশোধন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery Trust & Courier Health Pill */}
                  <div className="flex items-center justify-between text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      ডেলিভারি সাকসেস:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-extrabold ${
                        stats.trustLevel === 'high'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : stats.trustLevel === 'risk'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      {stats.custOrders.length > 0 ? `${stats.deliverySuccessRate}% সাকসেস` : '🌱 নতুন বায়ার'}
                    </span>
                  </div>

                  {/* Address Box */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="flex items-start gap-1.5 leading-snug">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {cust.area ? `${cust.area}, ` : ''}
                        {cust.district} - {cust.address}
                      </span>
                    </p>
                    {cust.notes && (
                      <p className="italic text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60 truncate">
                        নোট: {cust.notes}
                      </p>
                    )}
                  </div>

                  {/* Order & Spending Highlights */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 block">মোট অর্ডার</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {stats.custOrders.length || cust.totalOrders || 0} টি
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/40">
                      <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block">মোট ক্রয়</span>
                      <span className="font-black text-teal-600 dark:text-teal-400 text-xs">
                        ৳{(stats.totalSpent || cust.totalSpent || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 block">গড় অর্ডার</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        ৳{Math.round(stats.avgOrder).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Bar on Card */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateOrderForCustomer(cust);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="এই কাস্টমারের তথ্য দিয়ে নতুন অর্ডার ফর্ম ওপেন করুন"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>নতুন অর্ডার</span>
                  </button>

                  <a
                    href={`tel:${cust.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="সরাসরি কল দিন"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                  </a>

                  <a
                    href={`https://wa.me/88${cust.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
                    title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Customer Profile Drawer / Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-5 border-l border-slate-200 dark:border-slate-800 custom-scrollbar flex flex-col justify-between">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {viewingCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      {viewingCustomer.name}
                      {getCustomerStats(viewingCustomer.phone).tier === 'VIP' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          ⭐ VIP ক্লায়েন্ট
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-teal-600" /> {viewingCustomer.phone}
                      {viewingCustomer.altPhone && (
                        <span className="text-slate-400">/ {viewingCustomer.altPhone}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingCustomer(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Action Button Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* 1. Main New Order Button (Direct Auto-Populate) */}
                <button
                  onClick={() => {
                    initiateOrderForCustomer(viewingCustomer);
                    setViewingCustomer(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  title="এই কাস্টমারের নাম, ফোন, জেলা ও ঠিকানা দিয়ে সরাসরি নতুন অর্ডার তৈরি করুন"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>নতুন অর্ডার তৈরি</span>
                </button>

                {/* 2. Direct Call Action */}
                <a
                  href={`tel:${viewingCustomer.phone}`}
                  className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>কল করুন</span>
                </a>

                {/* 3. WhatsApp Templates Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                    className="w-full px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showWhatsAppMenu && (
                    <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700 uppercase">
                        মেসেজ টেমপ্লেট নির্বাচন করুন:
                      </p>
                      <a
                        href={getWhatsAppUrl(viewingCustomer, 'confirm')}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-slate-800 dark:text-slate-200 text-left"
                      >
                        📦 ১. অর্ডার কনফার্মেশন মেসেজ
                      </a>
                      <a
                        href={getWhatsAppUrl(viewingCustomer, 'tracking')}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-slate-800 dark:text-slate-200 text-left"
                      >
                        🚚 ২. কুরিয়ার ট্র্যাকিং আপডেট
                      </a>
                      <a
                        href={getWhatsAppUrl(viewingCustomer, 'offer')}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-slate-800 dark:text-slate-200 text-left"
                      >
                        🎁 ৩. ভিআইপি লয়ালটি ডিসকাউন্ট
                      </a>
                      <a
                        href={getWhatsAppUrl(viewingCustomer, 'address')}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-slate-800 dark:text-slate-200 text-left"
                      >
                        📍 ৪. ডেলিভারি ঠিকানা ভেরিফাই
                      </a>
                    </div>
                  )}
                </div>

                {/* 4. Edit Profile Button */}
                <button
                  onClick={() => {
                    const custToEdit = viewingCustomer;
                    setViewingCustomer(null);
                    openEditModal(custToEdit);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>
              </div>

              {/* Financial Lifetime & Courier Health Metrics */}
              {(() => {
                const stats = getCustomerStats(viewingCustomer.phone);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">মোট অর্ডার</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {stats.custOrders.length} টি
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block">
                          মোট পারচেজ (LTV)
                        </span>
                        <span className="font-black text-teal-600 dark:text-teal-400 text-base">
                          ৳{stats.totalSpent.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                          সফল ডেলিভারি
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                          {stats.completedOrders.length} টি
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">
                          রিটার্ন / ক্যানসেল
                        </span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 text-base">
                          {stats.returnedOrders.length} টি
                        </span>
                      </div>
                    </div>

                    {/* Courier Trust & Preference Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ডেলিভারি ট্রাস্ট রেট:
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                            stats.trustLevel === 'high'
                              ? 'bg-emerald-500 text-white'
                              : stats.trustLevel === 'risk'
                              ? 'bg-rose-500 text-white'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {stats.custOrders.length > 0 ? `${stats.deliverySuccessRate}%` : '১০০%'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        <span>ডিফল্ট কুরিয়ার: <strong>{stats.preferredCourier}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Profile Drawer Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold pt-2 overflow-x-auto">
                <button
                  onClick={() => setActiveProfileTab('orders')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    activeProfileTab === 'orders'
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  অর্ডার হিস্ট্রি ({getCustomerStats(viewingCustomer.phone).custOrders.length})
                </button>

                <button
                  onClick={() => setActiveProfileTab('favorites')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    activeProfileTab === 'favorites'
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  পছন্দের পণ্যসমূহ ({getCustomerStats(viewingCustomer.phone).topProducts.length})
                </button>

                <button
                  onClick={() => setActiveProfileTab('notes')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    activeProfileTab === 'notes'
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  CRM ট্যাগ ও বিশেষ নোট
                </button>

                <button
                  onClick={() => setActiveProfileTab('info')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    activeProfileTab === 'info'
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  পূর্ণ ঠিকানা ও ডেলিভারি তথ্য
                </button>
              </div>

              {/* Tab 1: Order History & Repeat Order Action */}
              {activeProfileTab === 'orders' && (
                <div className="space-y-3 pt-2">
                  {getCustomerStats(viewingCustomer.phone).custOrders.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                      <p>এই কাস্টমারের এখনও কোনো অর্ডার রেকর্ড তৈরি করা হয়নি।</p>
                      <button
                        onClick={() => {
                          initiateOrderForCustomer(viewingCustomer);
                          setViewingCustomer(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs cursor-pointer shadow-md inline-block"
                      >
                        প্রথম অর্ডারটি তৈরি করুন
                      </button>
                    </div>
                  ) : (
                    getCustomerStats(viewingCustomer.phone).custOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white">{ord.orderNumber}</span>
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              {ord.orderStatus}
                            </span>
                            {ord.courier && (
                              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <Truck className="w-3 h-3 text-teal-600" /> {ord.courier}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">{ord.date}</span>
                        </div>

                        {/* Items Summary */}
                        <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {it.productName} × {it.quantity}
                              </span>
                              <span className="font-semibold">
                                ৳{(Number(it.totalPrice) || ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1)) || 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Payment & Action row */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-400">পেমেন্ট: {ord.paymentMethod}</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">
                              টোটাল: ৳{(Number(ord.grandTotal) || 0).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Repeat Order Action with these exact items */}
                            <button
                              onClick={() => {
                                initiateOrderForCustomer(viewingCustomer, ord.items);
                                setViewingCustomer(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer border border-teal-200 dark:border-teal-800"
                              title="এই অর্ডারের পণ্যগুলো দিয়ে সরাসরি রিপিট অর্ডার তৈরি করুন"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>রিপিট অর্ডার</span>
                            </button>

                            <button
                              onClick={() => {
                                setViewingCustomer(null);
                                openInvoiceModal(ord);
                              }}
                              className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>ইনভয়েস প্রিন্ট</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Top Purchased Products Breakdown */}
              {activeProfileTab === 'favorites' && (
                <div className="space-y-3 pt-2 text-xs">
                  {getCustomerStats(viewingCustomer.phone).topProducts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      এখনও কোনো পণ্য কেনার হিস্ট্রি নেই।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-500 text-[11px] font-semibold">
                        এই কাস্টমার যেসব পণ্য সবচেয়ে বেশি অর্ডার করেছেন:
                      </p>
                      {getCustomerStats(viewingCustomer.phone).topProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              সর্বশেষ কেনা: {p.lastDate} • মোট ব্যয়: ৳{p.totalSpent.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-extrabold text-xs">
                              {p.totalQty} পিস
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: CRM Tags & Internal Notes */}
              {activeProfileTab === 'notes' && (
                <div className="space-y-4 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>ইন্টারনাল CRM রেকর্ড:</strong> এই ট্যাগ ও কাস্টমার নোটগুলো শুধুমাত্র আপনার অ্যাডমিন ডিরেক্টরিতে থাকবে, পার্সেল অর্ডারের ডেলিভারি নোটে অটো-ইনসার্ট হবে না।
                    </span>
                  </div>

                  {noteSavedFeedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      কাস্টমার নোট সফলভাবে সেভ হয়েছে!
                    </div>
                  )}

                  {/* Quick Clickable CRM Tags */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      দ্রুত CRM ট্যাগ যোগ করুন (১-ক্লিকে সেভ):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '⭐ ভিআইপি ক্লায়েন্ট',
                        '⚡ দ্রুত ডেলিভারি দিতে হবে',
                        '📦 স্টিডফাস্ট কুরিয়ার প্রেফার্ড',
                        '💰 ক্যাশ অন ডেলিভারি',
                        '⚠️ পার্সেল পাঠানোর পূর্বে কল দিয়ে কনফার্ম করবেন',
                        '🎁 পরবর্তী অর্ডারে ফ্রি স্যাম্পল গিফট',
                        '💎 নিয়মিত রিপিট বায়ার',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddQuickTag(tag)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 hover:text-teal-700 font-bold text-[11px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      কাস্টমারের বিশেষ ডেলিভারি পছন্দ বা নোটস
                    </label>
                    <textarea
                      rows={4}
                      value={customerNoteText}
                      onChange={(e) => setCustomerNoteText(e.target.value)}
                      placeholder="যেমন: এই কাস্টমারকে স্পেশাল ১০% ছাড় দেয়া হয়, কুরিয়ারে ক্যাশ অন ডেলিভারি পছন্দ করেন..."
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white leading-relaxed font-medium"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveCustomerNote()}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>নোট সেভ করুন</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Detailed Address & Info */}
              {activeProfileTab === 'info' && (
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">কাস্টমারের পূর্ণ নাম:</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{viewingCustomer.name}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">মোবাইল নম্বর:</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-sm">{viewingCustomer.phone}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">জেলা (District):</span>
                        <strong className="text-slate-900 dark:text-white">{viewingCustomer.district}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">থানা / এরিয়া (Area):</span>
                        <strong className="text-slate-900 dark:text-white">{viewingCustomer.area || 'N/A'}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">পূর্ণ ডেলিভারি ঠিকানা:</span>
                      <strong className="text-slate-900 dark:text-white leading-relaxed block mt-0.5">
                        {viewingCustomer.address}
                      </strong>
                    </div>

                    {/* Fast Copy Delivery Address */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">কুরিয়ার লেবেল কপি:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `নাম: ${viewingCustomer.name}\nফোন: ${viewingCustomer.phone}${
                              viewingCustomer.altPhone ? `, ${viewingCustomer.altPhone}` : ''
                            }\nঠিকানা: ${viewingCustomer.address}, ${viewingCustomer.area ? `${viewingCustomer.area}, ` : ''}${
                              viewingCustomer.district
                            }`,
                            'কুরিয়ার ঠিকানা'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>ঠিকানা কপি করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {editingCustomer ? 'কাস্টমার প্রোফাইল সংশোধন' : 'নতুন কাস্টমার নিবন্ধন'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">কাস্টমারের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রহিমা ভানু"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিকল্প ফোন (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="01800000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    জেলা (District) * <span className="text-[10px] text-teal-600 font-normal">(English/বাংলা সার্চ)</span>
                  </label>
                  <DistrictSearchSelect
                    value={district}
                    onChange={(d) => setDistrict(d)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    থানা / উপজেলা (Area)
                  </label>
                  <ThanaSearchSelect
                    value={area}
                    onChange={(a) => setArea(a)}
                    district={district}
                    placeholder="থানা লিখুন বা সিলেক্ট করুন..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="রোড নম্বর, বাসা নম্বর, এলাকা..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">অভ্যন্তরীণ নোট/মন্তব্য</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="কাস্টমার সম্পর্কিত বিশেষ কোনো নোট থাকলে লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                {editingCustomer ? (
                  confirmDelete ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">ডিলিট নিশ্চিত?</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingCustomer) {
                            deleteCustomer(editingCustomer.id);
                            setConfirmDelete(false);
                            setModalOpen(false);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        হ্যাঁ
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        না
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> কাস্টমার ডিলিট
                    </button>
                  )
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      setModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    সেভ করুন
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
