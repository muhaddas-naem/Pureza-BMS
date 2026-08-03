import React, { useState } from 'react';
import {
  Search,
  Plus,
  Printer,
  Copy,
  Trash2,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  PlusCircle,
  Save,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourierName, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../types';
import { bdDistricts } from '../data/mockData';
import { DistrictSearchSelect } from '../components/DistrictSearchSelect';
import { ProductSearchSelect } from '../components/ProductSearchSelect';

export const OrdersView: React.FC = () => {
  const {
    orders,
    products,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    duplicateOrder,
    openInvoiceModal,
    setActiveTab,
    searchTerm,
    setSearchTerm,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courierFilter, setCourierFilter] = useState<string>('All');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerAltPhone, setEditCustomerAltPhone] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCourier, setEditCourier] = useState<CourierName>('Pathao');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>('New');
  const [editDiscount, setEditDiscount] = useState(0);
  const [editDeliveryCharge, setEditDeliveryCharge] = useState(80);
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    const matchesCourier = courierFilter === 'All' || order.courier === courierFilter;

    return matchesSearch && matchesStatus && matchesCourier;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((item) => item !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleBulkStatusChange = (newStatus: OrderStatus) => {
    if (selectedOrders.length === 0) return;
    if (confirm(`বাছাইকৃত ${selectedOrders.length} টি অর্ডারের স্ট্যাটাস '${newStatus}' করতে চান?`)) {
      selectedOrders.forEach((id) => updateOrderStatus(id, newStatus));
      setSelectedOrders([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    setConfirmBulkDelete(true);
  };

  const exportCSV = () => {
    const headers = 'Order ID,Customer Name,Phone,District,Items,Grand Total,Payment Method,Payment Status,Status,Courier,Date\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${o.district}","${o.items.length}",${o.grandTotal},"${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}","${o.courier}","${o.date}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pureza_orders_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Open Edit Order Modal
  const openEditOrderModal = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone);
    setEditCustomerAltPhone(order.customerAltPhone || '');
    setEditDistrict(order.district);
    setEditArea(order.area || '');
    setEditAddress(order.address);
    setEditCourier(order.courier);
    setEditTrackingNumber(order.trackingNumber || '');
    setEditPaymentStatus(order.paymentStatus);
    setEditPaymentMethod(order.paymentMethod);
    setEditOrderStatus(order.orderStatus);
    setEditDiscount(order.discount || 0);
    setEditDeliveryCharge(order.deliveryCharge || 80);
    setEditNotes(order.notes || '');
    setEditItems([...order.items]);
  };

  // Edit Item Helper Functions
  const handleItemQtyChange = (index: number, newQty: number) => {
    const qty = Math.max(0.5, newQty);
    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: qty,
              totalPrice: qty * item.unitPrice,
            }
          : item
      )
    );
  };

  const handleItemUnitPriceChange = (index: number, newPrice: number) => {
    const price = Math.max(0, newPrice);
    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              unitPrice: price,
              totalPrice: item.quantity * price,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (index: number) => {
    if (editItems.length <= 1) {
      alert('কমপক্ষে ১ টি পণ্য অর্ডারে থাকতে হবে!');
      return;
    }
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItemFromProducts = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Check if item already exists
    const existingIndex = editItems.findIndex((it) => it.productId === prod.id);
    if (existingIndex >= 0) {
      handleItemQtyChange(existingIndex, editItems[existingIndex].quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: 'item-' + Date.now() + Math.random(),
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unitPrice: prod.salePrice,
        buyingPrice: prod.buyPrice || 0,
        totalPrice: prod.salePrice,
      };
      setEditItems((prev) => [...prev, newItem]);
    }
  };

  // Submit Edit Order
  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const subtotal = editItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const grandTotal = Math.max(0, subtotal - editDiscount + editDeliveryCharge);

    const updatedOrder: Order = {
      ...editingOrder,
      customerName: editCustomerName,
      customerPhone: editCustomerPhone,
      customerAltPhone: editCustomerAltPhone,
      district: editDistrict,
      area: editArea,
      address: editAddress,
      courier: editCourier,
      trackingNumber: editTrackingNumber,
      paymentStatus: editPaymentStatus,
      paymentMethod: editPaymentMethod,
      orderStatus: editOrderStatus,
      items: editItems,
      subtotal,
      discount: editDiscount,
      deliveryCharge: editDeliveryCharge,
      grandTotal,
      notes: editNotes,
    };

    updateOrder(updatedOrder);
    setEditingOrder(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Processing':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'Returned':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            অর্ডার ম্যানেজমেন্ট প্যানেল
          </h2>
          <p className="text-xs text-slate-500">
            মোট অর্ডার: {orders.length} টি | দেখানো হচ্ছে: {filteredOrders.length} টি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> এক্সপোর্ট CSV
          </button>

          <button
            onClick={() => setActiveTab('new-order')}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন অর্ডার যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Filters & Bulk Action Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অর্ডার আইডি, ফোন বা নাম..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="All">সকল স্ট্যাটাস (All Status)</option>
              <option value="New">New (নতুন)</option>
              <option value="Confirmed">Confirmed (কনফার্মড)</option>
              <option value="Processing">Processing (প্রসেসিং)</option>
              <option value="Packed">Packed (প্যাকড)</option>
              <option value="Shipped">Shipped (শিপড)</option>
              <option value="Delivered">Delivered (ডেলিভার্ড)</option>
              <option value="Cancelled">Cancelled (বাতিল)</option>
              <option value="Returned">Returned (রিটার্নড)</option>
            </select>
          </div>

          {/* Courier Filter */}
          <div>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="All">সকল কুরিয়ার (All Courier)</option>
              <option value="Pathao">Pathao</option>
              <option value="Steadfast">Steadfast</option>
              <option value="RedX">RedX</option>
              <option value="Paperfly">Paperfly</option>
              <option value="Sundarban">Sundarban</option>
            </select>
          </div>

          {/* Bulk Action Bar */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800 col-span-1 md:col-span-1">
              <span className="font-bold text-[11px] text-amber-800 dark:text-amber-300">
                {selectedOrders.length} টি সিলেক্টেড:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStatusChange(e.target.value as OrderStatus);
                }}
                defaultValue=""
                className="p-1 rounded bg-white dark:bg-slate-800 text-[11px] font-bold"
              >
                <option value="" disabled>
                  স্ট্যাটাস বাল্ক চেঞ্জ
                </option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleBulkDelete}
                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                title="বাল্ক ডিলিট"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-teal-600"
                  />
                </th>
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">কাস্টমার ও জেলা</th>
                <th className="py-3 px-4">আইটেম সংখ্যা</th>
                <th className="py-3 px-4">মোট বিল (৳)</th>
                <th className="py-3 px-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="py-3 px-4">কুরিয়ার</th>
                <th className="py-3 px-4">অর্ডার স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-slate-300 text-teal-600"
                      />
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{order.orderNumber}</div>
                      <span className="text-[10px] font-normal text-slate-400">{order.date}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.customerPhone} | <span className="font-bold text-teal-600">{order.district}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} টি পণ্য
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                      ৳{order.grandTotal.toLocaleString('bn-BD')}
                    </td>

                    {/* Quick Editable Payment Status */}
                    <td className="py-3 px-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value as PaymentStatus;
                          updateOrder({ ...order, paymentStatus: newStatus });
                        }}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md border border-transparent focus:outline-hidden cursor-pointer ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <option value="Paid">Paid (পরিশোধিত)</option>
                        <option value="Unpaid">Unpaid (বকেয়া)</option>
                        <option value="Partial">Partial (আংশিক)</option>
                      </select>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {order.courier}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border border-transparent focus:outline-hidden cursor-pointer ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditOrderModal(order)}
                        className="p-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg hover:bg-amber-100 cursor-pointer"
                        title="অর্ডার এডিট করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openInvoiceModal(order)}
                        className="p-1.5 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 rounded-lg hover:bg-teal-100 cursor-pointer"
                        title="ইনভয়েস প্রিন্ট"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer"
                        title="অর্ডার ডিটেইলস ও টাইমলাইন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => duplicateOrder(order.id)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer"
                        title="অর্ডার কপি/ডুপ্লিকেট"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                        title="অর্ডার ডিলিট"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            পৃষ্ঠা {currentPage} / {totalPages}
          </span>
          <div className="flex items-center space-x-2 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    অর্ডার এডিট: {editingOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    অর্ডারের যেকোনো তথ্য, পণ্য, পেমেন্ট ও ডেলিভারি আপডেট করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-6 text-xs">
              {/* Grid 1: Customer Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> গ্রাহক তথ্য (Customer Information)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">গ্রাহকের নাম *</label>
                    <input
                      type="text"
                      required
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={editCustomerPhone}
                      onChange={(e) => setEditCustomerPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">বিকল্প নম্বর</label>
                    <input
                      type="text"
                      value={editCustomerAltPhone}
                      onChange={(e) => setEditCustomerAltPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">জেলা (District) * <span className="text-[10px] text-teal-600 font-normal">(English/বাংলা সার্চ)</span></label>
                    <DistrictSearchSelect
                      value={editDistrict}
                      onChange={(d) => setEditDistrict(d)}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">থানা / এরিয়া</label>
                    <input
                      type="text"
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">পূর্ণ ঠিকানা *</label>
                    <input
                      type="text"
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Status, Courier & Payment */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> শিপিং, কুরিয়ার ও পেমেন্ট
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">পেমেন্ট স্ট্যাটাস *</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value="Paid">Paid (পরিশোধিত)</option>
                      <option value="Unpaid">Unpaid (বকেয়া)</option>
                      <option value="Partial">Partial (আংশিক)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">পেমেন্ট মেথড</label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">কুরিয়ার সার্ভিস</label>
                    <select
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value as CourierName)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="Pathao">Pathao</option>
                      <option value="Steadfast">Steadfast</option>
                      <option value="RedX">RedX</option>
                      <option value="Paperfly">Paperfly</option>
                      <option value="Sundarban">Sundarban</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">অর্ডার স্ট্যাটাস</label>
                    <select
                      value={editOrderStatus}
                      onChange={(e) => setEditOrderStatus(e.target.value as OrderStatus)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">ট্র্যাকিং নম্বর (Tracking #)</label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="যেমন: PTH-987654"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">বিশেষ মন্তব্য (Notes)</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="অর্ডারের বিশেষ নোট..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: Order Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                    অর্ডারকৃত পণ্যের তালিকা (Items)
                  </h4>

                  {/* Quick Add Product Dropdown */}
                  <div className="flex items-center gap-2 min-w-[240px]">
                    <span className="text-slate-500 whitespace-nowrap">পণ্য যোগ:</span>
                    <ProductSearchSelect
                      products={products}
                      selectedProductId=""
                      onChange={(prodId) => {
                        if (prodId) {
                          handleAddItemFromProducts(prodId);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <th className="p-2.5">পণ্য</th>
                        <th className="p-2.5 w-28 text-center">পরিমাণ (কেজি/টি)</th>
                        <th className="p-2.5 w-28 text-right">একক মূল্য (৳)</th>
                        <th className="p-2.5 w-28 text-right">মোট (৳)</th>
                        <th className="p-2.5 w-12 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {editItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {item.productName}
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={item.quantity}
                              onChange={(e) => handleItemQtyChange(idx, parseFloat(e.target.value) || 0.5)}
                              className="w-20 p-1.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 font-bold"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-24 p-1.5 text-right rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                            />
                          </td>
                          <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">
                            ৳{item.totalPrice.toLocaleString('bn-BD')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-semibold mb-1">ডিসকাউন্ট / ছাড় (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editDeliveryCharge}
                    onChange={(e) => setEditDeliveryCharge(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="flex flex-col justify-center items-end bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-widest">
                    সর্বমোট বিল (Grand Total)
                  </span>
                  <span className="text-xl font-black text-teal-800 dark:text-teal-200">
                    ৳
                    {(
                      editItems.reduce((sum, item) => sum + item.totalPrice, 0) -
                      editDiscount +
                      editDeliveryCharge
                    ).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details & Timeline Drawer Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  অর্ডার বিবরণী: {selectedOrderDetails.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">তারিখ: {selectedOrderDetails.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                গ্রাহক: {selectedOrderDetails.customerName} ({selectedOrderDetails.customerPhone})
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                ঠিকানা: {selectedOrderDetails.address}, {selectedOrderDetails.area}, {selectedOrderDetails.district}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                কুরিয়ার: <span className="font-bold text-teal-600">{selectedOrderDetails.courier}</span> | পেমেন্ট: {selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})
              </p>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">পণ্যের তালিকা</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <span className="font-bold">৳{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status History Timeline */}
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">
                স্ট্যাটাস টাইমলাইন (Status Timeline)
              </h4>
              <div className="relative pl-6 border-l-2 border-teal-500 space-y-4 text-xs">
                {selectedOrderDetails.statusHistory.map((hist, hIdx) => (
                  <div key={hIdx} className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900"></span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{hist.status}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({hist.timestamp})</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{hist.notes || 'আপডেট করা হয়েছে'}</p>
                    <span className="text-[10px] text-slate-400 block">দ্বারা: {hist.updatedBy}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  const ord = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  openInvoiceModal(ord);
                }}
                className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> ইনভয়েস প্রিন্ট
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Order Delete Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">অর্ডার ডিলিট নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">এই রেকর্ডটি স্থায়ীভাবে মুছে যাবে</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">অর্ডার নং: {deletingOrder.orderNumber}</p>
              <p className="text-slate-500">গ্রাহক: {deletingOrder.customerName} ({deletingOrder.customerPhone})</p>
              <p className="text-slate-500">মোট বিল: ৳{deletingOrder.grandTotal}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(deletingOrder.id);
                  setDeletingOrder(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">বাল্ক ডিলিট নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">বাছাইকৃত {selectedOrders.length} টি অর্ডার একবারে মুছে ফেলতে চান?</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  selectedOrders.forEach((id) => deleteOrder(id));
                  setSelectedOrders([]);
                  setConfirmBulkDelete(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                হ্যাঁ, সব ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
