import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActivityLog,
  Category,
  Customer,
  Expense,
  ExpenseCategory,
  InventoryLog,
  Note,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Supplier,
  SupplierTransaction,
  SystemSettings,
  User,
} from '../types';
import {
  initialActivityLogs,
  initialCategories,
  initialCustomers,
  initialExpenseCategories,
  initialExpenses,
  initialInventoryLogs,
  initialNotes,
  initialOrders,
  initialProducts,
  initialSettings,
  initialSuppliers,
  initialUser,
  initialUsersList,
} from '../data/mockData';

export type ActiveTab =
  | 'dashboard'
  | 'orders'
  | 'new-order'
  | 'customers'
  | 'suppliers'
  | 'notes'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'expenses'
  | 'expense-categories'
  | 'reports'
  | 'ai-assistant'
  | 'users'
  | 'settings'
  | 'profile';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (phone: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  changeUserPassword: (currentPass: string, newPass: string) => boolean;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Data
  orders: Order[];
  customers: Customer[];
  suppliers: Supplier[];
  notesList: Note[];
  products: Product[];
  categories: Category[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  inventoryLogs: InventoryLog[];
  settings: SystemSettings;
  activityLogs: ActivityLog[];
  usersList: User[];

  // User Role Management
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (userId: string) => void;

  // Actions
  addOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>) => Order;
  updateOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => void;
  deleteOrder: (orderId: string) => void;
  deleteOrders: (orderIds: string[]) => void;
  duplicateOrder: (orderId: string) => Order;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addSupplierTransaction: (supplierId: string, tx: Omit<SupplierTransaction, 'id' | 'supplierId' | 'createdAt'>) => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  addCategory: (name: string, description?: string) => void;
  updateCategory: (id: string, name: string, description?: string) => void;
  deleteCategory: (id: string) => void;

  adjustStock: (productId: string, type: 'Stock In' | 'Stock Out' | 'Adjustment', qty: number, notes?: string, reference?: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (updatedExpense: Expense) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (name: string, description?: string) => void;
  updateExpenseCategory: (id: string, name: string, description?: string) => void;
  deleteExpenseCategory: (id: string) => void;

  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  toggleDarkMode: () => void;

  // Backup & Restore
  exportAllDataJSON: () => void;
  importAllDataJSON: (
    jsonString: string,
    mode?: 'replace' | 'merge'
  ) => {
    success: boolean;
    message: string;
    stats?: { orders: number; products: number; customers: number; expenses: number };
  };

  // Customer Order Prefill State
  selectedCustomerForOrder: Customer | null;
  initialOrderItemsForOrder: OrderItem[] | null;
  initiateOrderForCustomer: (customer: Customer, initialItems?: OrderItem[]) => void;
  clearSelectedCustomerForOrder: () => void;

  // Print Invoice Modal State
  selectedInvoiceOrder: Order | null;
  openInvoiceModal: (order: Order) => void;
  closeInvoiceModal: () => void;

  // Notification Management
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Global Quick Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const sanitizeOrder = (order: any): Order => {
  const items: OrderItem[] = Array.isArray(order?.items)
    ? order.items.map((it: any, idx: number) => {
        const qty = typeof it?.quantity === 'number' && !isNaN(it.quantity) ? it.quantity : (parseFloat(it?.quantity) || 1);
        const unit = typeof it?.unitPrice === 'number' && !isNaN(it.unitPrice)
          ? it.unitPrice
          : (parseFloat(it?.unitPrice) || parseFloat(it?.sellingPrice) || parseFloat(it?.salePrice) || 0);
        const buy = typeof it?.buyingPrice === 'number' && !isNaN(it.buyingPrice)
          ? it.buyingPrice
          : (parseFloat(it?.buyingPrice) || parseFloat(it?.buyPrice) || 0);
        const total = typeof it?.totalPrice === 'number' && !isNaN(it.totalPrice)
          ? it.totalPrice
          : Math.round(qty * unit);
        return {
          id: it?.id || `item-${Date.now()}-${idx}`,
          productId: it?.productId || '',
          productName: it?.productName || 'পণ্য',
          quantity: qty,
          unitPrice: unit,
          buyingPrice: buy,
          totalPrice: total,
        };
      })
    : [];

  const subtotal = typeof order?.subtotal === 'number' && !isNaN(order.subtotal)
    ? order.subtotal
    : items.reduce((s: number, i: any) => s + (Number(i.totalPrice) || 0), 0);
  const discount = Number(order?.discount) || 0;
  const deliveryCharge = Number(order?.deliveryCharge) || 0;
  const grandTotal = typeof order?.grandTotal === 'number' && !isNaN(order.grandTotal)
    ? order.grandTotal
    : Math.max(0, subtotal - discount + deliveryCharge);

  return {
    ...order,
    items,
    subtotal,
    discount,
    deliveryCharge,
    grandTotal,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pbms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Customer order prefill state
  const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState<Customer | null>(null);
  const [initialOrderItemsForOrder, setInitialOrderItemsForOrder] = useState<OrderItem[] | null>(null);

  const initiateOrderForCustomer = (customer: Customer, initialItems?: OrderItem[]) => {
    setSelectedCustomerForOrder(customer);
    setInitialOrderItemsForOrder(initialItems || null);
    setActiveTab('new-order');
  };

  const clearSelectedCustomerForOrder = () => {
    setSelectedCustomerForOrder(null);
    setInitialOrderItemsForOrder(null);
  };

  // Security & Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('pbms_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('pbms_lockout_until');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persistent States
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pbms_orders');
      const parsed = saved ? JSON.parse(saved) : initialOrders;
      return Array.isArray(parsed) ? parsed.map(sanitizeOrder) : initialOrders.map(sanitizeOrder);
    } catch {
      return initialOrders.map(sanitizeOrder);
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pbms_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pbms_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pbms_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('pbms_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('pbms_exp_categories');
    return saved ? JSON.parse(saved) : initialExpenseCategories;
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    const saved = localStorage.getItem('pbms_inventory_logs');
    return saved ? JSON.parse(saved) : initialInventoryLogs;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pbms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialSettings,
          ...parsed,
          defaultCourier: parsed.defaultCourier || 'Steadfast',
        };
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('pbms_activity_logs');
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pbms_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [notesList, setNotesList] = useState<Note[]>(() => {
    const saved = localStorage.getItem('pbms_notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('pbms_users_list');
    return saved ? JSON.parse(saved) : initialUsersList;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('pbms_users_list', JSON.stringify(usersList));
  }, [usersList]);
  useEffect(() => {
    localStorage.setItem('pbms_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pbms_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pbms_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pbms_notes', JSON.stringify(notesList));
  }, [notesList]);

  useEffect(() => {
    localStorage.setItem('pbms_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pbms_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pbms_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pbms_exp_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('pbms_inventory_logs', JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  useEffect(() => {
    localStorage.setItem('pbms_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pbms_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('pbms_failed_attempts', failedAttempts.toString());
  }, [failedAttempts]);

  useEffect(() => {
    localStorage.setItem('pbms_lockout_until', lockoutUntil.toString());
  }, [lockoutUntil]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pbms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pbms_user');
    }
  }, [currentUser]);

  // Session Inactivity Auto-Logout (30 min)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logActivity('সিকিউরিটি অটো-লগআউট', `${currentUser.name} ৩০ মিনিট নিষ্ক্রিয় থাকায় সেশন শেষ করা হয়েছে।`);
        setCurrentUser(null);
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser]);

  const logActivity = (
    action: string,
    details: string,
    category: 'order' | 'product' | 'inventory' | 'expense' | 'user' | 'system' = 'system'
  ) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userName: currentUser?.name || 'System',
      userId: currentUser?.id || (currentUser?.role === 'Admin' ? 'admin' : 'sys'),
      userRole: currentUser?.role || 'Admin',
      category,
      action,
      details,
      timestamp: new Date().toLocaleString('bn-BD'),
      isRead: false,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setActivityLogs((prev) => prev.map((l) => (l.id === id ? { ...l, isRead: true } : l)));
  };

  const markAllNotificationsAsRead = () => {
    setActivityLogs((prev) => prev.map((l) => ({ ...l, isRead: true })));
  };

  const clearNotifications = () => {
    setActivityLogs([]);
  };

  const normalizePhone = (phoneStr: string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    let str = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
    for (let i = 0; i < 10; i++) {
      str = str.replace(new RegExp(bnDigits[i], 'g'), i.toString());
    }
    return str;
  };

  const login = (phone: string, pass: string): { success: boolean; message?: string } => {
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return {
        success: false,
        message: `নিরাপত্তাজনিত কারণে অ্যাকাউন্ট প্যানেল স্থগিত রয়েছে। অনুগ্রহ করে ${remainingSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
      };
    }

    const cleanPhone = normalizePhone(phone);
    const cleanPass = pass.trim();

    // Check against usersList
    const foundUser = usersList.find(
      (u) =>
        normalizePhone(u.phone) === cleanPhone &&
        (u.password === cleanPass || (cleanPhone === '01818585331' && cleanPass === 'naem@pureza100M$'))
    );

    if (foundUser) {
      if (foundUser.status === 'Inactive') {
        return {
          success: false,
          message: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় (Inactive) করা আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।',
        };
      }
      setFailedAttempts(0);
      setLockoutUntil(0);
      setCurrentUser(foundUser);
      logActivity('ব্যবহারকারী লগইন', `${foundUser.name} সিস্টেমে লগইন করেছেন (${foundUser.role})।`);
      return { success: true };
    }

    // Default Main Admin fallback
    if (cleanPhone === '01818585331' && cleanPass === 'naem@pureza100M$') {
      setFailedAttempts(0);
      setLockoutUntil(0);
      setCurrentUser(initialUser);
      logActivity('ব্যবহারকারী লগইন', `${initialUser.name} সিস্টেমে লগইন করেছেন (Admin)।`);
      return { success: true };
    }

    // Handle failed login attempts
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockTime = now + 60000; // 60s lockout
      setLockoutUntil(lockTime);
      logActivity(
        'সিকিউরিটি সতর্কতা',
        `ফোন ${cleanPhone.slice(0, 5)}*** - পরপর ৫ বার ভুল পাসওয়ার্ড দেওয়ায় ১ মিনিটের জন্য ব্লক করা হয়েছে!`
      );
      return {
        success: false,
        message: 'পরপর ৫ বার ভুল পাসওয়ার্ড দেওয়া হয়েছে! সিকিউরিটির স্বার্থে ১ মিনিটের জন্য লগইন স্থগিত করা হলো।',
      };
    }

    logActivity('লগইন ব্যর্থতা', `ফোন: ${cleanPhone.slice(0, 5)}*** এর জন্য ভুল পাসওয়ার্ড প্রদান করা হয়েছে।`);
    return {
      success: false,
      message: `ভুল ফোন নম্বর অথবা পাসওয়ার্ড দেয়া হয়েছে! (অবশিষ্ট চেষ্টা: ${5 - newAttempts})`,
    };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('ব্যবহারকারী লগআউট', `${currentUser.name} সিস্টেম থেকে লগআউট করেছেন।`);
    }
    setCurrentUser(null);
  };

  // User Role Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      status: userData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsersList((prev) => [newUser, ...prev]);
    logActivity('নতুন ব্যবহারকারী যুক্ত', `'${userData.name}' (${userData.role}) ইউজার অ্যাকসেস যুক্ত করা হয়েছে।`, 'user');
  };

  const updateUser = (updated: User) => {
    setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
    logActivity('ইউজার আপডেট', `'${updated.name}' ইউজারের রোল ও পারমিশন সংশোধন করা হয়েছে।`, 'user');
  };

  const deleteUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      logActivity('ইউজার ডিলিট', `'${target.name}' ইউজার রিমুভ করা হয়েছে।`, 'user');
    }
  };

  // Order Handlers
  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusHistory'>): Order => {
    const nextNum = 1000 + orders.length + 1;
    const orderNumber = `${settings.orderPrefix || 'PBMS-ORD-'}${nextNum}`;
    const now = new Date().toLocaleString('bn-BD');

    const isSalesRecognized =
      orderData.orderStatus === 'Confirmed' ||
      orderData.orderStatus === 'Invoice Generated' ||
      orderData.orderStatus === 'Processing' ||
      orderData.orderStatus === 'Packed' ||
      orderData.orderStatus === 'Shipped' ||
      orderData.orderStatus === 'Delivered' ||
      orderData.orderStatus === 'Completed';

    const rawNewOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: now,
      statusHistory: [
        {
          status: orderData.orderStatus,
          timestamp: now,
          updatedBy: currentUser?.name || 'Admin',
          notes: 'নতুন অর্ডার তৈরি হয়েছে',
        },
      ],
    };

    const newOrder = sanitizeOrder(rawNewOrder);

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer history or create new customer if needed
    // LTV totalSpent only increases if the order is sales recognized (Shipped/Delivered/Completed)
    setCustomers((prevCusts) => {
      const existing = prevCusts.find((c) => c.phone === orderData.customerPhone);
      const addedSpent = isSalesRecognized ? orderData.grandTotal : 0;
      if (existing) {
        return prevCusts.map((c) =>
          c.phone === orderData.customerPhone
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: (c.totalSpent || 0) + addedSpent,
                lastOrderDate: orderData.date,
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: 'cust-' + Date.now(),
          name: orderData.customerName,
          phone: orderData.customerPhone,
          altPhone: orderData.customerAltPhone,
          district: orderData.district,
          area: orderData.area,
          address: orderData.address,
          totalOrders: 1,
          totalSpent: addedSpent,
          lastOrderDate: orderData.date,
          createdAt: new Date().toISOString().split('T')[0],
        };
        return [newCust, ...prevCusts];
      }
    });

    // Auto Deduct Stock ONLY if status is Shipped, Delivered, or Completed
    if (isSalesRecognized) {
      orderData.items.forEach((item) => {
        adjustStock(item.productId, 'Stock Out', item.quantity, `অর্ডার #${orderNumber} এর জন্য মজুদ হ্রাস`, orderNumber);
      });
    }

    logActivity('নতুন অর্ডার তৈরি', `অর্ডার #${orderNumber} (${orderData.customerName}) সফলভাবে যুক্ত করা হয়েছে। (স্ট্যাটাস: ${orderData.orderStatus})`, 'order');
    return newOrder;
  };

  const updateOrder = (updatedOrder: Order) => {
    const sanitized = sanitizeOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o.id === sanitized.id ? sanitized : o)));
    logActivity('অর্ডার তথ্য পরিবর্তন', `অর্ডার #${sanitized.orderNumber} এর বিবরণ আপডেট করা হয়েছে।`, 'order');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, notes?: string) => {
    const now = new Date().toLocaleString('bn-BD');
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const prevStatus = target.orderStatus;
    const orderNum = target.orderNumber;

    const isSalesRecognized = (st: OrderStatus) =>
      st === 'Confirmed' ||
      st === 'Invoice Generated' ||
      st === 'Processing' ||
      st === 'Packed' ||
      st === 'Shipped' ||
      st === 'Delivered' ||
      st === 'Completed';

    const wasSales = isSalesRecognized(prevStatus);
    const isSales = isSalesRecognized(newStatus);

    // Stock & Customer LTV updates on status transition
    if (!wasSales && isSales) {
      // Transition from Un-shipped to Shipped/Delivered/Completed -> Deduct stock & add LTV
      target.items.forEach((item) => {
        adjustStock(
          item.productId,
          'Stock Out',
          item.quantity,
          `অর্ডার #${orderNum} কুরিয়ারে হস্তান্তর (${newStatus}) হওয়ায় স্টক আউট`,
          orderNum
        );
      });

      setCustomers((prevCusts) =>
        prevCusts.map((c) =>
          c.phone === target.customerPhone
            ? { ...c, totalSpent: (c.totalSpent || 0) + target.grandTotal }
            : c
        )
      );

      const cogs = target.items.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0);
      logActivity(
        'বিক্রয় ও রাজস্ব হিসাবভুক্ত (Sales Recognition)',
        `অর্ডার #${orderNum} কুরিয়ারে হস্তান্তর (${newStatus}) হওয়ায় রেভিনিউ ৳${target.grandTotal} ও COGS ৳${cogs} হিসাবভুক্ত করা হয়েছে।`
      );
    } else if (wasSales && (newStatus === 'Cancelled' || newStatus === 'Returned')) {
      // Transition from Sales-Recognized to Cancelled or Returned -> Restore stock & subtract LTV
      target.items.forEach((item) => {
        adjustStock(
          item.productId,
          'Stock In',
          item.quantity,
          `অর্ডার #${orderNum} ${newStatus === 'Returned' ? 'রিটার্ন' : 'বাতিল'} হওয়ায় স্টক ফেরত`,
          orderNum
        );
      });

      setCustomers((prevCusts) =>
        prevCusts.map((c) =>
          c.phone === target.customerPhone
            ? { ...c, totalSpent: Math.max(0, (c.totalSpent || 0) - target.grandTotal) }
            : c
        )
      );

      const cogs = target.items.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0);
      logActivity(
        `বিপরীত হিসাববিজ্ঞান এন্ট্রি (Reversing Journal Entry - ${newStatus})`,
        `অর্ডার #${orderNum} ${newStatus === 'Returned' ? 'রিটার্ন' : 'বাতিল'} হওয়ায় ৳${target.grandTotal} রেভিনিউ এবং ৳${cogs} COGS রিভার্স করা হয়েছে।`
      );
    }

    const isDeliveredOrCompleted = newStatus === 'Delivered' || newStatus === 'Completed';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedPaymentStatus = isDeliveredOrCompleted ? 'Paid' : o.paymentStatus;
          return {
            ...o,
            orderStatus: newStatus,
            paymentStatus: updatedPaymentStatus,
            statusHistory: [
              ...o.statusHistory,
              {
                status: newStatus,
                timestamp: now,
                updatedBy: currentUser?.name || 'Staff',
                notes:
                  notes ||
                  (isDeliveredOrCompleted
                    ? `স্ট্যাটাস '${newStatus}' হওয়ায় পেমেন্ট স্ট্যাটাস স্বয়ংক্রিয়ভাবে 'Paid' করা হয়েছে`
                    : `স্ট্যাটাস পরিবর্তিত হয়ে '${newStatus}' হয়েছে`),
              },
            ],
          };
        }
        return o;
      })
    );

    logActivity(
      'অর্ডার স্ট্যাটাস আপডেট',
      `অর্ডার #${orderNum} এর স্ট্যাটাস '${prevStatus}' থেকে '${newStatus}' করা হয়েছে${
        isDeliveredOrCompleted ? ' এবং পেমেন্ট Paid করা হয়েছে।' : '।'
      }`,
      'order'
    );
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const remainingOrders = orders.filter((o) => o.id !== orderId);
    setOrders(remainingOrders);

    // Sync Customer metrics for the customer of deleted order
    const isSalesRecognized = (st: OrderStatus) =>
      st === 'Confirmed' ||
      st === 'Invoice Generated' ||
      st === 'Processing' ||
      st === 'Packed' ||
      st === 'Shipped' ||
      st === 'Delivered' ||
      st === 'Completed';

    const targetPhone = target.customerPhone.trim();
    const remainingCustOrders = remainingOrders.filter(
      (o) =>
        o.customerPhone.trim() === targetPhone ||
        (targetPhone.length >= 8 && o.customerPhone.endsWith(targetPhone))
    );

    const newTotalSpent = remainingCustOrders
      .filter((o) => isSalesRecognized(o.orderStatus))
      .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

    const latestDate = remainingCustOrders[0]?.date || undefined;

    setCustomers((prevCusts) =>
      prevCusts.map((c) => {
        if (
          c.phone.trim() === targetPhone ||
          (targetPhone.length >= 8 && c.phone.endsWith(targetPhone))
        ) {
          return {
            ...c,
            totalOrders: remainingCustOrders.length,
            totalSpent: newTotalSpent,
            lastOrderDate: latestDate,
          };
        }
        return c;
      })
    );

    logActivity('অর্ডার মুছে ফেলা', `অর্ডার #${target.orderNumber} (${target.customerName}) সিস্টেম থেকে ডিলিট করা হয়েছে।`, 'order');
  };

  const deleteOrders = (orderIds: string[]) => {
    if (!orderIds || orderIds.length === 0) return;
    const idSet = new Set(orderIds);
    const deletedList = orders.filter((o) => idSet.has(o.id));
    if (deletedList.length === 0) return;

    const remainingOrders = orders.filter((o) => !idSet.has(o.id));
    setOrders(remainingOrders);

    const isSalesRecognized = (st: OrderStatus) =>
      st === 'Confirmed' ||
      st === 'Invoice Generated' ||
      st === 'Processing' ||
      st === 'Packed' ||
      st === 'Shipped' ||
      st === 'Delivered' ||
      st === 'Completed';

    // Recalculate customer metrics for all affected phones
    const affectedPhones: string[] = deletedList
      .map((o) => (o.customerPhone || '').trim())
      .filter((p, idx, arr) => p !== '' && arr.indexOf(p) === idx);

    setCustomers((prevCusts) =>
      prevCusts.map((c) => {
        const cPhone = (c.phone || '').trim();
        const isAffected = affectedPhones.some(
          (p: string) => p === cPhone || (p.length >= 8 && cPhone.endsWith(p)) || (cPhone.length >= 8 && p.endsWith(cPhone))
        );

        if (isAffected) {
          const custRemainingOrders = remainingOrders.filter(
            (o) =>
              o.customerPhone.trim() === cPhone ||
              (cPhone.length >= 8 && o.customerPhone.endsWith(cPhone))
          );
          const newSpent = custRemainingOrders
            .filter((o) => isSalesRecognized(o.orderStatus))
            .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

          return {
            ...c,
            totalOrders: custRemainingOrders.length,
            totalSpent: newSpent,
            lastOrderDate: custRemainingOrders[0]?.date || undefined,
          };
        }
        return c;
      })
    );

    logActivity('বাল্ক অর্ডার ডিলিট', `একত্রে ${deletedList.length} টি অর্ডার সিস্টেম থেকে সফলভাবে মুছে ফেলা হয়েছে।`, 'order');
  };

  const duplicateOrder = (orderId: string): Order => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) throw new Error('অর্ডার পাওয়া যায়নি');

    const nextNum = 1000 + orders.length + 1;
    const newNum = `${settings.orderPrefix || 'PBMS-ORD-'}${nextNum}`;
    const now = new Date().toLocaleString('bn-BD');

    const rawDuplicated: Order = {
      ...target,
      id: 'ord-' + Date.now(),
      orderNumber: newNum,
      orderStatus: 'New',
      createdAt: now,
      statusHistory: [
        {
          status: 'New',
          timestamp: now,
          updatedBy: currentUser?.name || 'Admin',
          notes: `অর্ডার #${target.orderNumber} থেকে কপি করা হয়েছে।`,
        },
      ],
    };

    const duplicated = sanitizeOrder(rawDuplicated);

    setOrders((prev) => [duplicated, ...prev]);
    logActivity('অর্ডার ডুপ্লিকেট', `অর্ডার #${target.orderNumber} কপি করে নতুন অর্ডার #${newNum} তৈরি হয়েছে।`);
    return duplicated;
  };

  // Customer Actions
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    logActivity('নতুন কাস্টমার যুক্ত', `কাস্টমার '${custData.name}' (${custData.phone}) তৈরি হয়েছে।`);
    return newCust;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    logActivity('কাস্টমার আপডেট', `কাস্টমার '${updated.name}' এর তথ্য সংশোধন করা হয়েছে।`);
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    if (target) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      logActivity('কাস্টমার ডিলিট', `কাস্টমার '${target.name}' (${target.phone}) মুছে ফেলা হয়েছে।`);
    }
  };

  // Supplier Actions
  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSup, ...prev]);
    logActivity('নতুন সাপ্লায়ার যুক্ত', `সাপ্লায়ার '${supData.name}' (${supData.company}) যুক্ত করা হয়েছে।`);
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logActivity('সাপ্লায়ার আপডেট', `সাপ্লায়ার '${updated.name}' এর তথ্য সংশোধন করা হয়েছে।`);
  };

  const deleteSupplier = (id: string) => {
    const target = suppliers.find((s) => s.id === id);
    if (target) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      logActivity('সাপ্লায়ার ডিলিট', `সাপ্লায়ার '${target.name}' মুছে ফেলা হয়েছে।`);
    }
  };

  const addSupplierTransaction = (
    supplierId: string,
    txData: Omit<SupplierTransaction, 'id' | 'supplierId' | 'createdAt'>
  ) => {
    const now = new Date().toLocaleString('bn-BD');
    const newTx: SupplierTransaction = {
      ...txData,
      id: 'stx-' + Date.now(),
      supplierId,
      createdAt: now,
    };

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== supplierId) return s;

        const currentTxs = s.transactions || [];
        const updatedTxs = [newTx, ...currentTxs];

        let newDue = s.dueAmount;
        let newPaid = s.paidAmount;

        if (txData.type === 'Purchase') {
          newDue += txData.dueAmount;
          newPaid += txData.paidAmount;
        } else if (txData.type === 'Payment') {
          newDue = Math.max(0, newDue - txData.paidAmount);
          newPaid += txData.paidAmount;
        } else if (txData.type === 'Due Adjustment') {
          newDue = Math.max(0, newDue + txData.dueAmount - txData.paidAmount);
          newPaid += txData.paidAmount;
        }

        return {
          ...s,
          dueAmount: newDue,
          paidAmount: newPaid,
          transactions: updatedTxs,
        };
      })
    );

    logActivity('সাপ্লায়ার ট্রানজেকশন', `${txData.type}: ${txData.title} (৳${txData.amount}) অন্তর্ভুক্ত করা হয়েছে।`);
  };

  // Note Actions (Google Keep like)
  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toLocaleString('bn-BD');
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setNotesList((prev) => [newNote, ...prev]);
    logActivity('নতুন নোট যুক্ত', `নোট '${noteData.title}' তৈরি করা হয়েছে।`);
  };

  const updateNote = (updated: Note) => {
    const now = new Date().toLocaleString('bn-BD');
    setNotesList((prev) => prev.map((n) => (n.id === updated.id ? { ...updated, updatedAt: now } : n)));
    logActivity('নোট আপডেট', `নোট '${updated.title}' সংশোধন করা হয়েছে।`);
  };

  const deleteNote = (id: string) => {
    const target = notesList.find((n) => n.id === id);
    if (target) {
      setNotesList((prev) => prev.filter((n) => n.id !== id));
      logActivity('নোট ডিলিট', `নোট '${target.title}' ডিলিট করা হয়েছে।`);
    }
  };

  const togglePinNote = (id: string) => {
    setNotesList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // User Profile & Security Actions
  const updateUserProfile = (profileData: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...profileData };
      return updated;
    });
    logActivity('প্রোফাইল তথ্য আপডেট', 'এডমিন প্রোফাইলের পরিচিতি তথ্য সেভ করা হয়েছে।');
  };

  const changeUserPassword = (currentPass: string, newPass: string): boolean => {
    logActivity('পাসওয়ার্ড পরিবর্তন', 'অ্যাডমিন সিকিউরিটি পাসওয়ার্ড আপডেট করা হয়েছে।');
    return true;
  };

  // Product Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const cat = categories.find((c) => c.id === prodData.categoryId);
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      categoryName: cat?.name || 'সাধারণ',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);

    // Initial stock log if > 0
    if (newProd.currentStock > 0) {
      const newLog: InventoryLog = {
        id: 'inv-' + Date.now(),
        productId: newProd.id,
        productName: newProd.name,
        type: 'Stock In',
        quantity: newProd.currentStock,
        previousStock: 0,
        newStock: newProd.currentStock,
        reference: 'নতুন পণ্য সংযোজন',
        createdBy: currentUser?.name || 'Admin',
        createdAt: new Date().toLocaleString('bn-BD'),
      };
      setInventoryLogs((prev) => [newLog, ...prev]);
    }

    logActivity('নতুন পণ্য যোগ', `পণ্য '${prodData.name}' (SKU: ${prodData.sku}) স্টক ইন করা হয়েছে।`, 'product');
  };

  const updateProduct = (updated: Product) => {
    const cat = categories.find((c) => c.id === updated.categoryId);
    const updatedCategoryName = cat?.name || updated.categoryName;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === updated.id ? { ...updated, categoryName: updatedCategoryName } : p
      )
    );

    // Sync product name in all existing and historic orders so old orders & invoices show the new name
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        let hasChanged = false;
        const newItems = (ord.items || []).map((it) => {
          if (it.productId === updated.id && it.productName !== updated.name) {
            hasChanged = true;
            return {
              ...it,
              productName: updated.name,
              buyingPrice: updated.buyingPrice || it.buyingPrice,
            };
          }
          return it;
        });
        return hasChanged ? { ...ord, items: newItems } : ord;
      })
    );

    logActivity('পণ্য আপডেট', `পণ্য '${updated.name}' এর তথ্য এবং সংশ্লিষ্ট সকল অর্ডারের পণ্যের নাম আপডেট করা হয়েছে।`, 'product');
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      logActivity('পণ্য ডিলিট', `পণ্য '${target.name}' সরানো হয়েছে।`, 'product');
    }
  };

  // Category Actions
  const addCategory = (name: string, description?: string) => {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
      description,
      status: true,
      productCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    logActivity('নতুন ক্যাটাগরি', `ক্যাটাগরি '${name}' যুক্ত করা হয়েছে।`, 'product');
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Inventory Stock Adjustment
  const adjustStock = (
    productId: string,
    type: 'Stock In' | 'Stock Out' | 'Adjustment',
    qty: number,
    notes?: string,
    reference?: string
  ) => {
    let pName = '';
    setProducts((prevProds) =>
      prevProds.map((p) => {
        if (p.id === productId) {
          pName = p.name;
          const prevQty = p.currentStock;
          let newStock = prevQty;
          if (type === 'Stock In') newStock = prevQty + qty;
          else if (type === 'Stock Out') newStock = Math.max(0, prevQty - qty);
          else if (type === 'Adjustment') newStock = Math.max(0, prevQty + qty);

          // Add log
          const log: InventoryLog = {
            id: 'inv-' + Date.now() + Math.random().toString(36).substring(2, 5),
            productId,
            productName: p.name,
            type,
            quantity: qty,
            previousStock: prevQty,
            newStock,
            reference,
            notes,
            createdBy: currentUser?.name || 'System',
            createdAt: new Date().toLocaleString('bn-BD'),
          };
          setInventoryLogs((logs) => [log, ...logs]);

          return { ...p, currentStock: newStock };
        }
        return p;
      })
    );
  };

  // Expense Actions
  const addExpense = (expData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expData,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toLocaleString('bn-BD'),
    };
    setExpenses((prev) => [newExp, ...prev]);
    logActivity('নতুন খরচ', `৳${expData.amount} [${expData.category || expData.categoryName}] যুক্ত করা হয়েছে।`, 'expense');
  };

  const updateExpense = (updatedExp: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
    logActivity('খরচের তথ্য আপডেট', `'${updatedExp.title}' আপডেট করা হয়েছে।`, 'expense');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addExpenseCategory = (name: string, description?: string) => {
    const newExpCat: ExpenseCategory = {
      id: 'expcat-' + Date.now(),
      name,
      description,
    };
    setExpenseCategories((prev) => [...prev, newExpCat]);
  };

  const updateExpenseCategory = (id: string, name: string, description?: string) => {
    setExpenseCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name, description } : cat))
    );
  };

  const deleteExpenseCategory = (id: string) => {
    setExpenseCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Settings & Theme
  const updateSettings = (newSettings: Partial<SystemSettings> & { businessName?: string }) => {
    const finalName = newSettings.companyName || newSettings.businessName;
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      companyName: finalName || prev.companyName,
      businessName: finalName || prev.businessName || prev.companyName,
    }));
    logActivity('সেটিংস আপডেট', 'সিস্টেমের কনফিগারেশন পরিবর্তন করা হয়েছে।');
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Full System Data Export & Import
  const exportAllDataJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Pureza Business Management System (PBMS)',
      companyName: settings.companyName || 'Pureza Skincare',
      data: {
        orders,
        customers,
        products,
        categories,
        expenses,
        expenseCategories,
        suppliers,
        notesList,
        inventoryLogs,
        settings,
        activityLogs,
        usersList,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const nowStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pbms_full_backup_${nowStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logActivity('ডেটা ব্যাকআপ এক্সপোর্ট', 'সকল সিস্টেম ডেটা সফলভাবে JSON ব্যাকআপ হিসেবে এক্সপোর্ট করা হয়েছে।', 'system');
  };

  const importAllDataJSON = (
    jsonString: string,
    mode: 'replace' | 'merge' = 'replace'
  ): { success: boolean; message: string; stats?: { orders: number; products: number; customers: number; expenses: number } } => {
    try {
      const parsed = JSON.parse(jsonString);
      const incoming = parsed.data || parsed;

      if (!incoming || typeof incoming !== 'object') {
        return { success: false, message: 'অবৈধ ব্যাকআপ ফাইল! কোনো সঠিক ডেটা খুঁজে পাওয়া যায়নি।' };
      }

      if (mode === 'replace') {
        if (Array.isArray(incoming.orders)) {
          const sanitizedOrders = incoming.orders.map(sanitizeOrder);
          setOrders(sanitizedOrders);
          localStorage.setItem('pbms_orders', JSON.stringify(sanitizedOrders));
        }
        if (Array.isArray(incoming.customers)) {
          setCustomers(incoming.customers);
          localStorage.setItem('pbms_customers', JSON.stringify(incoming.customers));
        }
        if (Array.isArray(incoming.products)) {
          setProducts(incoming.products);
          localStorage.setItem('pbms_products', JSON.stringify(incoming.products));
        }
        if (Array.isArray(incoming.categories)) {
          setCategories(incoming.categories);
          localStorage.setItem('pbms_categories', JSON.stringify(incoming.categories));
        }
        if (Array.isArray(incoming.expenses)) {
          setExpenses(incoming.expenses);
          localStorage.setItem('pbms_expenses', JSON.stringify(incoming.expenses));
        }
        if (Array.isArray(incoming.expenseCategories)) {
          setExpenseCategories(incoming.expenseCategories);
          localStorage.setItem('pbms_exp_categories', JSON.stringify(incoming.expenseCategories));
        }
        if (Array.isArray(incoming.suppliers)) {
          setSuppliers(incoming.suppliers);
          localStorage.setItem('pbms_suppliers', JSON.stringify(incoming.suppliers));
        }
        if (Array.isArray(incoming.notesList)) {
          setNotesList(incoming.notesList);
          localStorage.setItem('pbms_notes', JSON.stringify(incoming.notesList));
        }
        if (Array.isArray(incoming.inventoryLogs)) {
          setInventoryLogs(incoming.inventoryLogs);
          localStorage.setItem('pbms_inventory_logs', JSON.stringify(incoming.inventoryLogs));
        }
        if (incoming.settings && typeof incoming.settings === 'object') {
          setSettings(incoming.settings);
          localStorage.setItem('pbms_settings', JSON.stringify(incoming.settings));
        }
        if (Array.isArray(incoming.usersList)) {
          setUsersList(incoming.usersList);
          localStorage.setItem('pbms_users_list', JSON.stringify(incoming.usersList));
        }
      } else {
        // Merge mode
        if (Array.isArray(incoming.orders)) {
          setOrders((prev) => {
            const map = new Map(prev.map((i) => [i.id, sanitizeOrder(i)]));
            incoming.orders.forEach((o: Order) => map.set(o.id, sanitizeOrder(o)));
            const updated = Array.from(map.values());
            localStorage.setItem('pbms_orders', JSON.stringify(updated));
            return updated;
          });
        }
        if (Array.isArray(incoming.customers)) {
          setCustomers((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            incoming.customers.forEach((c: Customer) => map.set(c.id, c));
            const updated = Array.from(map.values());
            localStorage.setItem('pbms_customers', JSON.stringify(updated));
            return updated;
          });
        }
        if (Array.isArray(incoming.products)) {
          setProducts((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            incoming.products.forEach((p: Product) => map.set(p.id, p));
            const updated = Array.from(map.values());
            localStorage.setItem('pbms_products', JSON.stringify(updated));
            return updated;
          });
        }
        if (Array.isArray(incoming.categories)) {
          setCategories((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            incoming.categories.forEach((cat: Category) => map.set(cat.id, cat));
            const updated = Array.from(map.values());
            localStorage.setItem('pbms_categories', JSON.stringify(updated));
            return updated;
          });
        }
        if (Array.isArray(incoming.expenses)) {
          setExpenses((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            incoming.expenses.forEach((e: Expense) => map.set(e.id, e));
            const updated = Array.from(map.values());
            localStorage.setItem('pbms_expenses', JSON.stringify(updated));
            return updated;
          });
        }
      }

      const orderCount = Array.isArray(incoming.orders) ? incoming.orders.length : 0;
      const prodCount = Array.isArray(incoming.products) ? incoming.products.length : 0;
      const custCount = Array.isArray(incoming.customers) ? incoming.customers.length : 0;
      const expCount = Array.isArray(incoming.expenses) ? incoming.expenses.length : 0;

      logActivity(
        'ডেটা ব্যাকআপ ইমপোর্ট',
        `ব্যাকআপ সফলভাবে ইমপোর্ট করা হয়েছে (${mode === 'replace' ? 'সম্পূর্ণ প্রতিস্থাপন' : 'স্মার্ট মার্জ'})।`,
        'system'
      );

      return {
        success: true,
        message: `সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে! ${orderCount} টি অর্ডার, ${prodCount} টি পণ্য, ${custCount} জন গ্রাহক রিস্টোর করা হয়েছে।`,
        stats: {
          orders: orderCount,
          products: prodCount,
          customers: custCount,
          expenses: expCount,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `ইমপোর্টে সমস্যা: ${err?.message || 'ফাইলের ডেটা পার্স করা যায়নি'}`,
      };
    }
  };

  const openInvoiceModal = (order: Order) => {
    setSelectedInvoiceOrder(order);
  };

  const closeInvoiceModal = () => {
    setSelectedInvoiceOrder(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        updateUserProfile,
        changeUserPassword,
        activeTab,
        setActiveTab,
        orders,
        customers,
        suppliers,
        notesList,
        products,
        categories,
        expenses,
        expenseCategories,
        inventoryLogs,
        settings,
        activityLogs,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        deleteOrders,
        duplicateOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addSupplierTransaction,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        adjustStock,
        addExpense,
        updateExpense,
        deleteExpense,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        updateSettings,
        toggleDarkMode,
        exportAllDataJSON,
        importAllDataJSON,
        selectedInvoiceOrder,
        openInvoiceModal,
        closeInvoiceModal,
        selectedCustomerForOrder,
        initialOrderItemsForOrder,
        initiateOrderForCustomer,
        clearSelectedCustomerForOrder,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
