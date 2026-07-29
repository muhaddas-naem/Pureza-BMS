export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Courier';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  permissions?: string[]; // Allowed ActiveTab values
  status?: 'Active' | 'Inactive';
  avatar?: string;
  createdAt?: string;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cash on Delivery';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';

export type CourierName = 'Pathao' | 'Steadfast' | 'RedX' | 'Paperfly' | 'Sundarban' | 'Other';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  district: string;
  area: string;
  address: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode?: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  image?: string;
  description?: string;
  status: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  buyingPrice: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., PBMS-ORD-1001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  district: string;
  area: string;
  address: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  courier: CourierName;
  trackingNumber?: string;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export type InventoryLogType = 'Stock In' | 'Stock Out' | 'Adjustment';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: InventoryLogType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Expense {
  id: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  title: string;
  date: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paidBy: string;
  notes?: string;
  description?: string;
  attachmentName?: string;
  createdAt?: string;
}

export interface SystemSettings {
  companyName: string;
  businessName?: string;
  tagline?: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  orderPrefix: string;
  invoicePrefix: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  paymentMethods: string[];
  couriers: string[];
  darkMode: boolean;
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  type: 'Purchase' | 'Payment' | 'Due Adjustment';
  title: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  date: string;
  invoiceNo?: string;
  itemsSummary?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  productType?: string;
  dueAmount: number;
  paidAmount: number;
  notes?: string;
  transactions?: SupplierTransaction[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
