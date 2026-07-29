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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bdDistricts } from '../data/mockData';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders, setActiveTab, setSearchTerm } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.district.toLowerCase().includes(search.toLowerCase())
  );

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

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAltPhone(c.altPhone || '');
    setDistrict(c.district);
    setArea(c.area);
    setAddress(c.address);
    setNotes(c.notes || '');
    setModalOpen(true);
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> কাস্টমার মডিউল ও প্রোফাইল
          </h2>
          <p className="text-xs text-slate-500">মোট কাস্টমার সংখ্যা: {customers.length} জন</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> নতুন কাস্টমার যোগ করুন
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কাস্টমারের নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custOrders = orders.filter((o) => o.customerPhone === cust.phone);
          const totalSpent = custOrders.reduce((acc, o) => acc + o.grandTotal, 0);
          const avgOrder = custOrders.length > 0 ? totalSpent / custOrders.length : 0;

          return (
            <div
              key={cust.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 font-bold flex items-center justify-center text-base">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cust.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-teal-500" /> {cust.phone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(cust)}
                  className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg"
                  title="এডিট কাস্টমার"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> ঠিকানা: {cust.address}, {cust.district}
                </p>
                {cust.notes && <p className="italic text-slate-500 text-[11px]">নোট: {cust.notes}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">মোট অর্ডার</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {custOrders.length || cust.totalOrders} টি
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">মোট ক্রয়</span>
                  <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
                    ৳{totalSpent || cust.totalSpent}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">গড় অর্ডার</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    ৳{Math.round(avgOrder)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchTerm(cust.phone);
                  setActiveTab('orders');
                }}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> কাস্টমারের অর্ডারসমূহ দেখুন
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {editingCustomer ? 'কাস্টমার প্রোফাইল সংশোধন' : 'নতুন কাস্টমার নিবন্ধন'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">কাস্টমারের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">বিকল্প ফোন</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">জেলা *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    {bdDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">এরিয়া/থানা</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নোট/মন্তব্য</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                      <Trash2 className="w-3.5 h-3.5" /> কাস্টমার ডিলিট করুন
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
