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
  lastActive?: string;
  createdAt?: string;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Invoice Generated'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'
  | 'Returned'
  | 'Exchange';

export type PaymentMethod =
  | 'Cash'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank'
  | 'Card'
  | 'Cheque'
  | 'Cash on Delivery';

export type ExpenseStatus = 'Paid' | 'Pending' | 'Approved' | 'Cancelled';
export type ExpenseType = 'Expense' | 'Income' | 'Petty Cash' | 'Supplier Payment';

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
  type?: 'Expense' | 'Income';
}

export interface ExpenseHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

export interface Expense {
  id: string;
  expenseNumber?: string;
  referenceNumber?: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  title: string;
  date: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paidBy: string;
  createdBy?: string;
  notes?: string;
  description?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status?: ExpenseStatus;
  type?: ExpenseType;
  history?: ExpenseHistoryItem[];
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
  userId?: string;
  userRole?: UserRole;
  category?: 'order' | 'product' | 'inventory' | 'expense' | 'user' | 'system';
  action: string;
  details: string;
  timestamp: string;
  isRead?: boolean;
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

// Server API Request/Response Types
export interface AiAssistantRequest {
  prompt: string;
  context?: any;
  systemContext?: string;
}

export interface AiOrderParseRequest {
  rawText: string;
  availableProducts?: any[];
}

export interface InvoiceDownloadRequest {
  base64Data: string;
  fileName?: string;
  contentType?: string;
}
