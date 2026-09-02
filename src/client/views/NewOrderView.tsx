import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  X,
  User,
  Phone,
  MapPin,
  Package,
  Truck,
  CreditCard,
  FileText,
  Calculator,
  UserCheck,
  Search,
  Sparkles,
  Bot,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bdDistricts } from '../data/mockData';
import { CourierName, Customer, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../types';
import { DistrictSearchSelect } from '../components/DistrictSearchSelect';
import { ThanaSearchSelect } from '../components/ThanaSearchSelect';
import { ProductSearchSelect } from '../components/ProductSearchSelect';

export const NewOrderView: React.FC = () => {
  const {
    products,
    customers,
    addOrder,
    setActiveTab,
    settings,
    selectedCustomerForOrder,
    initialOrderItemsForOrder,
    clearSelectedCustomerForOrder,
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');

  const [autoFilled, setAutoFilled] = useState(false);
  const [matchedCustomerName, setMatchedCustomerName] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // AI Assist Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRawText, setAiRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParsedResult, setAiParsedResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState('');
  const [fillSuccessMsg, setFillSuccessMsg] = useState('');

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'item-' + Date.now(),
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      quantity: 1,
      buyingPrice: products[0]?.buyingPrice || 0,
      unitPrice: products[0]?.sellingPrice || 0,
      totalPrice: products[0]?.sellingPrice || 0,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.deliveryChargeInsideDhaka || 80);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [courier, setCourier] = useState<CourierName>(
    (settings.defaultCourier as CourierName) || 'Steadfast'
  );
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('New');
  const [notes, setNotes] = useState('');

  // Sync default courier whenever settings change
  useEffect(() => {
    if (settings.defaultCourier) {
      setCourier(settings.defaultCourier as CourierName);
    }
  }, [settings.defaultCourier]);

  // Auto-populate when redirected from Customer Profile (selectedCustomerForOrder)
  useEffect(() => {
    if (selectedCustomerForOrder) {
      const cust = selectedCustomerForOrder;
      setCustomerName(cust.name || '');
      setCustomerPhone(cust.phone || '');
      setCustomerAltPhone(cust.altPhone || '');
      setDistrict(cust.district || 'ঢাকা');
      setArea(cust.area || '');
      setAddress(cust.address || '');
      // Note: Do NOT copy internal customer CRM notes/tags into order delivery notes
      setNotes('');
      setAutoFilled(true);
      setMatchedCustomerName(cust.name);

      if (cust.district === 'ঢাকা') {
        setDeliveryCharge(settings.deliveryChargeInsideDhaka || 80);
      } else {
        setDeliveryCharge(settings.deliveryChargeOutsideDhaka || 150);
      }

      if (initialOrderItemsForOrder && initialOrderItemsForOrder.length > 0) {
        setItems(
          initialOrderItemsForOrder.map((it, idx) => ({
            ...it,
            id: 'item-' + Date.now() + '-' + idx,
          }))
        );
      }

      // Clear the trigger so subsequent manual actions are clean
      clearSelectedCustomerForOrder();
    }
  }, [selectedCustomerForOrder, initialOrderItemsForOrder]);

  // Handle District Change to Auto Update Delivery Charge
  const handleDistrictChange = (selectedDist: string) => {
    setDistrict(selectedDist);
    if (selectedDist === 'ঢাকা') {
      setDeliveryCharge(settings.deliveryChargeInsideDhaka || 80);
    } else {
      setDeliveryCharge(settings.deliveryChargeOutsideDhaka || 150);
    }
  };

  // AI Order Parse Action
  const handleAiParse = async () => {
    if (!aiRawText.trim()) {
      setAiError('অনুগ্রহ করে কাস্টমারের মেসেজ বা টেক্সট এখানে পেস্ট করুন।');
      return;
    }
    setAiError('');
    setIsAiParsing(true);
    setAiParsedResult(null);

    try {
      const response = await fetch('/api/ai/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: aiRawText,
          availableProducts: products.map((p) => ({
            id: p.id,
            name: p.name,
            sellingPrice: p.sellingPrice,
            category: p.categoryName,
          })),
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiParsedResult(resData.data);
      } else {
        setAiError(resData.error || 'টেক্সট থেকে তথ্য এক্সট্রাক্ট করা যায়নি।');
      }
    } catch (err: any) {
      setAiError('এআই সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।');
    } finally {
      setIsAiParsing(false);
    }
  };

  // Apply AI Extracted Data directly into the Form
  const applyAiDataToForm = () => {
    if (!aiParsedResult) return;

    const data = aiParsedResult;

    if (data.customerName && data.customerName !== 'গ্রাহক') {
      setCustomerName(data.customerName);
    }
    if (data.phone) {
      setCustomerPhone(data.phone);
    }
    if (data.altPhone) {
      setCustomerAltPhone(data.altPhone);
    }

    if (data.district) {
      const matchDist = bdDistricts.find(
        (d) => d === data.district || d.includes(data.district) || data.district.includes(d)
      );
      if (matchDist) {
        handleDistrictChange(matchDist);
      } else {
        handleDistrictChange(data.district);
      }
    }

    if (data.area) {
      setArea(data.area);
    }

    if (data.address) {
      setAddress(data.address);
    }

    if (data.notes) {
      setNotes(data.notes);
    }

    if (data.courier) {
      const validCouriers: CourierName[] = [
        'Pathao',
        'Steadfast',
        'RedX',
        'Paperfly',
        'Sundarban',
        'Other',
      ];
      if (validCouriers.includes(data.courier as CourierName)) {
        setCourier(data.courier as CourierName);
      }
    }

    if (data.paymentMethod) {
      const validPayments: PaymentMethod[] = [
        'Cash on Delivery',
        'bKash',
        'Nagad',
        'Rocket',
        'Bank',
      ];
      if (validPayments.includes(data.paymentMethod as PaymentMethod)) {
        setPaymentMethod(data.paymentMethod as PaymentMethod);
      }
    }

    // Process parsed product items
    if (Array.isArray(data.items) && data.items.length > 0) {
      const newItemsList: OrderItem[] = [];

      data.items.forEach((parsedItem: any, idx: number) => {
        let prod = products.find((p) => p.id === parsedItem.matchedProductId);
        if (!prod && parsedItem.productName) {
          prod = products.find((p) =>
            p.name.toLowerCase().includes(parsedItem.productName.toLowerCase())
          );
        }
        if (!prod) {
          prod = products[0];
        }

        if (prod) {
          const qty = Number(parsedItem.quantity) || 1;
          newItemsList.push({
            id: 'item-' + Date.now() + '-' + idx,
            productId: prod.id,
            productName: prod.name,
            quantity: qty,
            buyingPrice: prod.buyingPrice,
            unitPrice: prod.sellingPrice,
            totalPrice: Math.round(prod.sellingPrice * qty),
          });
        }
      });

      if (newItemsList.length > 0) {
        setItems(newItemsList);
      }
    }

    setFillSuccessMsg('অর্ডারের সমস্ত তথ্য ফর্মে সফলভাবে অটোফিল করা হয়েছে!');
    setTimeout(() => {
      setFillSuccessMsg('');
      setShowAiModal(false);
    }, 1500);
  };

  // Customer Auto Fill on Phone Typing or Selection
  const applyCustomerInfo = (cust: Customer) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone);
    setCustomerAltPhone(cust.altPhone || '');
    setDistrict(cust.district);
    setArea(cust.area || '');
    setAddress(cust.address || '');
    setAutoFilled(true);
    setMatchedCustomerName(cust.name);
    setShowCustomerDropdown(false);

    if (cust.district === 'ঢাকা') {
      setDeliveryCharge(settings.deliveryChargeInsideDhaka || 80);
    } else {
      setDeliveryCharge(settings.deliveryChargeOutsideDhaka || 150);
    }
  };

  const handlePhoneInputChange = (inputVal: string) => {
    setCustomerPhone(inputVal);
    const clean = inputVal.trim();

    if (clean.length >= 3) {
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }

    const found = customers.find(
      (c) => c.phone.trim() === clean || (clean.length >= 8 && c.phone.endsWith(clean))
    );

    if (found) {
      applyCustomerInfo(found);
    } else {
      setAutoFilled(false);
    }
  };

  const filteredCustomerSuggestions = customers.filter(
    (c) =>
      customerPhone.trim() !== '' &&
      (c.phone.includes(customerPhone.trim()) ||
        c.name.toLowerCase().includes(customerPhone.toLowerCase()))
  );

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const updated = [...prev];
      const currentQty = updated[index].quantity;
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productName: prod.name,
        buyingPrice: prod.buyingPrice,
        unitPrice: prod.sellingPrice,
        totalPrice: Math.round(prod.sellingPrice * currentQty),
      };
      return updated;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    const validQty = Math.max(0.01, Math.round(qty * 100) / 100);
    setItems((prev) => {
      const updated = [...prev];
      const unit = updated[index].unitPrice;
      updated[index] = {
        ...updated[index],
        quantity: validQty,
        totalPrice: Math.round(unit * validQty),
      };
      return updated;
    });
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setItems((prev) => [
      ...prev,
      {
        id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 4),
        productId: defaultProd.id,
        productName: defaultProd.name,
        quantity: 1,
        buyingPrice: defaultProd.buyingPrice,
        unitPrice: defaultProd.sellingPrice,
        totalPrice: defaultProd.sellingPrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      alert('অনুগ্রহ করে কাস্টমারের নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }

    addOrder({
      customerId: 'cust-' + Date.now(),
      customerName,
      customerPhone,
      customerAltPhone,
      district,
      area: area || district,
      address,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      discount,
      deliveryCharge,
      grandTotal,
      paymentMethod,
      paymentStatus,
      courier,
      trackingNumber,
      orderStatus,
      notes,
    });

    setActiveTab('orders');
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            নতুন কাস্টমার অর্ডার ফরম
          </h2>
          <p className="text-xs text-slate-500">অর্ডারের তথ্য পূরণ করে বুকিং নিশ্চিত করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
          >
            বাতিল করুন
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" /> ১. কাস্টমারের নাম ও ঠিকানা
            </h3>
            {autoFilled && (
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-pulse">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> পূর্বে সংরক্ষিত কাস্টমার: {matchedCustomerName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="relative">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মোবাইল নম্বর * <span className="text-[10px] text-teal-600 font-normal">(নম্বর দিলে তথ্য অটোফিল হবে)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                  onFocus={() => {
                    if (customerPhone.length >= 2) setShowCustomerDropdown(true);
                  }}
                  placeholder="017........"
                  className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-bold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>

              {/* Suggestions Dropdown */}
              {showCustomerDropdown && filteredCustomerSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                    <span>সংরক্ষিত কাস্টমার পাওয়া গেছে ({filteredCustomerSuggestions.length})</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(false)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {filteredCustomerSuggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyCustomerInfo(c)}
                      className="w-full text-left p-2.5 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          {c.name} <span className="text-[10px] font-normal text-slate-400">({c.phone})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {c.district}, {c.address}
                        </p>
                      </div>
                      <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-full font-bold shrink-0">
                        সিলেক্ট করুন
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কাস্টমারের নাম *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: রহিমা ভানু"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিকল্প মোবাইল (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={customerAltPhone}
                onChange={(e) => setCustomerAltPhone(e.target.value)}
                placeholder="018........"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                জেলা (District) * <span className="text-[10px] text-teal-600 font-normal">(English/বাংলা সার্চ সুবিধা সহ)</span>
              </label>
              <DistrictSearchSelect
                value={district}
                onChange={(selectedDist) => handleDistrictChange(selectedDist)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                থানা / উপজেলা (Area) <span className="text-[10px] text-teal-600 font-normal">(English/বাংলা অটো সাজেস্ট ও কাস্টম)</span>
              </label>
              <ThanaSearchSelect
                value={area}
                onChange={(selectedArea) => setArea(selectedArea)}
                district={district}
                placeholder="থানা নির্বাচন করুন বা সরাসরি লিখুন..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পূর্ণাঙ্গ ডেলিভারি ঠিকানা *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা #, রোড #, এরিয়া..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Product Selection Items Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> ২. অর্ডারকৃত পণ্য নির্বাচন
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              মোট আইটেম: <strong className="text-teal-600">{items.length}</strong> টি
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-slate-400 mb-0.5">পণ্য সিলেক্ট / লাইভ সার্চ</label>
                  <ProductSearchSelect
                    products={products}
                    selectedProductId={item.productId}
                    onChange={(productId) => handleProductChange(index, productId)}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-slate-400 mb-0.5">পরিমাণ (কেজি / পিস)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(index, parseFloat(e.target.value) || 0.25)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  {/* Preset Pills for 250g (0.25), 0.5kg, 1kg, 1.5kg, 2kg, 3kg */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { val: 0.25, label: '250 গ্রাম' },
                      { val: 0.5, label: '0.5 কেজি' },
                      { val: 1, label: '1 কেজি' },
                      { val: 1.5, label: '1.5 কেজি' },
                      { val: 2, label: '2 কেজি' },
                      { val: 3, label: '3 কেজি' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleQtyChange(index, preset.val)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          item.quantity === preset.val
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">একক মূল্য</label>
                  <div className="p-2 font-bold text-slate-800 dark:text-white">৳{item.unitPrice}</div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">মোট মূল্য</label>
                  <div className="p-2 font-bold text-teal-600 dark:text-teal-400">৳{item.totalPrice}</div>
                </div>

                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Right Add Product Button */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={addItemRow}
              className="px-4 py-2 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> + আরও পণ্য যোগ করুন
            </button>
          </div>
        </div>

        {/* Courier & Payment Config Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-teal-600" /> ৩. কুরিয়ার ও পেমেন্ট বিবরণ
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                কুরিয়ার সার্ভিস
              </label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value as CourierName)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="Steadfast">স্টিডফাস্ট (Steadfast Courier) - ডিফল্ট</option>
                <option value="Sundarban">সুন্দরবন কুরিয়ার (Sundarban Courier)</option>
                <option value="Pathao">পাঠাও কুরিয়ার (Pathao Courier)</option>
                <option value="RedX">রেডএক্স (RedX Delivery)</option>
                <option value="Paperfly">পেপারফ্লাই (Paperfly)</option>
                <option value="Other">অন্যান্য কুরিয়ার (Other)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ট্র্যাকিং নম্বর (যদি থাকে)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="যেমন: PTH-990211"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="Cash on Delivery">ক্যাশ অন ডেলিভারি</option>
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Rocket">রকেট (Rocket)</option>
                  <option value="Bank">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট স্ট্যাটাস
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-teal-600"
                >
                  <option value="Unpaid">বকেয়া (Unpaid)</option>
                  <option value="Paid">পরিশোধিত (Paid)</option>
                  <option value="Partial">আংশিক (Partial)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                অর্ডার স্ট্যাটাস
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="New">New (নতুন)</option>
                <option value="Confirmed">Confirmed (কনফার্মড)</option>
                <option value="Processing">Processing (প্রসেসিং)</option>
                <option value="Packed">Packed (প্যাকড)</option>
                <option value="Shipped">Shipped (শিপড)</option>
                <option value="Delivered">Delivered (ডেলিভার্ড)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Grand Total Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Calculator className="w-4 h-4 text-teal-600" /> ৪. হিসাব ও বিল সামারি
              </h3>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>পণ্যের মোট দাম (Subtotal):</span>
                  <span className="font-bold text-slate-900 dark:text-white">৳{subtotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>ছাড়/ডিসকাউন্ট (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-28 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-right font-bold text-rose-600"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>ডেলিভারি চার্জ (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                    className="w-28 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-right font-bold"
                  />
                </div>

                <div className="pt-3 border-t-2 border-slate-800 dark:border-slate-700 flex justify-between items-center text-base font-black text-slate-900 dark:text-white">
                  <span>সর্বমোট প্রদেয় বিল:</span>
                  <span className="text-teal-600 dark:text-teal-400 text-xl">৳{grandTotal}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিশেষ নোট/মন্তব্য
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="যেমন: গেটম্যানের কাছে দিয়ে কল দিতে হবে..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> অর্ডার নিশ্চিত ও সেভ করুন
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* AI Assist Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md font-bold text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    AI Assist - এলোমেলো টেক্সট হতে অর্ডার তথ্য
                  </h3>
                  <p className="text-xs text-slate-500">
                    মেসেঞ্জার, মেসেজ বা কল নোট কপি করে পেস্ট করুন (বাংলা/English/Banglish সমর্থিত)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Text Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                কাস্টমারের এলোমেলো বার্তা বা চ্যাট টেক্সট *
              </label>
              <textarea
                rows={4}
                value={aiRawText}
                onChange={(e) => setAiRawText(e.target.value)}
                placeholder="যেমন: ভাই আমার নাম সোহেল, ফোন 01812345678, ২ টা কেয়ার শ্যাম্পু পাঠাইয়েন ধানমন্ডি ঢাকায়..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
            </div>

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
                {aiError}
              </div>
            )}

            {fillSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {fillSuccessMsg}
              </div>
            )}

            {/* AI Action Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiParsing}
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 cursor-pointer"
              >
                {isAiParsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI বিশ্লেষণ করছে...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>AI দিয়ে তথ্য বের করুন ✨</span>
                  </>
                )}
              </button>
            </div>

            {/* Parsed Result Preview */}
            {aiParsedResult && (
              <div className="p-4 rounded-2xl bg-teal-950/20 dark:bg-teal-950/40 border border-teal-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                  <span className="font-extrabold text-teal-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> এক্সট্রাক্টকৃত তথ্যের সামারি:
                  </span>
                  <span className="text-[10px] text-slate-400">সঠিক তথ্য থাকলে অটোফিল বোতামে চাপুন</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">নাম:</span>
                    <span className="font-bold text-white">{aiParsedResult.customerName || 'N/A'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">মোবাইল:</span>
                    <span className="font-bold text-teal-300 font-mono">
                      {aiParsedResult.phone || 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">জেলা ও এলাকা:</span>
                    <span className="font-bold text-white">
                      {aiParsedResult.district} {aiParsedResult.area ? `(${aiParsedResult.area})` : ''}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 block">পূর্ণাঙ্গ ঠিকানা:</span>
                    <span className="font-semibold text-slate-200">{aiParsedResult.address || 'N/A'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 block">শনাক্তকৃত পণ্যসমূহ:</span>
                    <div className="space-y-1 mt-1">
                      {Array.isArray(aiParsedResult.items) &&
                        aiParsedResult.items.map((it: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px] bg-slate-800/80 px-2 py-1 rounded-md text-teal-200"
                          >
                            <span>📦 {it.productName}</span>
                            <span className="font-bold">পরিমাণ: {it.quantity || 1}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {aiParsedResult.notes && (
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-3">
                      <span className="text-[10px] text-slate-400 block">নোট/পেমেন্ট মন্তব্য:</span>
                      <span className="text-amber-300">{aiParsedResult.notes}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={applyAiDataToForm}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95"
                >
                  <Wand2 className="w-4 h-4" /> ফর্মে অটো-ফিল করুন (Fill Form Now)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
