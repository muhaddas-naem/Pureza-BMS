/**
 * Database Schema Definitions and DDL Generator
 *
 * Responsibilities:
 * - Defines column schemas for all PBMS domain entities.
 * - Generates engine-specific SQL DDL for SQLite, MySQL, and PostgreSQL.
 */

export const TABLE_NAMES = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  USER_SESSIONS: 'user_sessions',
  LOGIN_LOGS: 'login_logs',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  INVENTORY_LOGS: 'inventory_logs',
  EXPENSES: 'expenses',
  EXPENSE_CATEGORIES: 'expense_categories',
  ACTIVITY_LOGS: 'activity_logs',
  SETTINGS: 'settings',
  SUPPLIERS: 'suppliers',
  NOTES: 'notes',
} as const;

export function generateCreateTableQueries(driver: 'sqlite' | 'mysql' | 'postgres' | string = 'sqlite'): string[] {
  if (driver === 'mysql') {
    return [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Staff',
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        avatar VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(50) PRIMARY KEY,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        refresh_token VARCHAR(255) NOT NULL,
        user_agent TEXT NULL,
        ip_address VARCHAR(45) NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NULL,
        email VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        status TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        barcode VARCHAR(50) NULL,
        buying_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        current_stock INT NOT NULL DEFAULT 0,
        min_stock INT NOT NULL DEFAULT 5,
        image VARCHAR(255) NULL,
        description TEXT NULL,
        status TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        alt_phone VARCHAR(20) NULL,
        district VARCHAR(50) NOT NULL,
        area VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        notes TEXT NULL,
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        district VARCHAR(50) NOT NULL,
        area VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        date VARCHAR(20) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0.00,
        delivery_charge DECIMAL(10,2) DEFAULT 0.00,
        grand_total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
        courier VARCHAR(50) NOT NULL,
        tracking_number VARCHAR(100) NULL,
        order_status VARCHAR(30) NOT NULL DEFAULT 'New',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        quantity INT NOT NULL,
        buying_price DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS inventory_logs (
        id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        type VARCHAR(30) NOT NULL,
        quantity INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        reference VARCHAR(100) NULL,
        notes TEXT NULL,
        created_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        date VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NULL,
        paid_by VARCHAR(100) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        order_prefix VARCHAR(20) DEFAULT 'PBMS-ORD-',
        invoice_prefix VARCHAR(20) DEFAULT 'PBMS-INV-',
        delivery_charge_inside DECIMAL(10,2) DEFAULT 80.00,
        delivery_charge_outside DECIMAL(10,2) DEFAULT 150.00
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];
  }

  // SQLite and Default SQL Engine Definition
  return [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT,
      role TEXT NOT NULL DEFAULT 'Staff',
      status TEXT NOT NULL DEFAULT 'Active',
      avatar TEXT,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      refreshToken TEXT NOT NULL,
      userAgent TEXT,
      ipAddress TEXT,
      expiresAt TEXT,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS login_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      email TEXT NOT NULL,
      status TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      timestamp TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status INTEGER DEFAULT 1
    );`,

    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT,
      buyingPrice REAL NOT NULL DEFAULT 0,
      sellingPrice REAL NOT NULL DEFAULT 0,
      currentStock INTEGER NOT NULL DEFAULT 0,
      minStock INTEGER NOT NULL DEFAULT 5,
      image TEXT,
      description TEXT,
      status INTEGER DEFAULT 1,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      altPhone TEXT,
      district TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT,
      totalOrders INTEGER DEFAULT 0,
      totalSpent REAL DEFAULT 0,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      district TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      deliveryCharge REAL DEFAULT 0,
      grandTotal REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL DEFAULT 'Unpaid',
      courier TEXT NOT NULL,
      trackingNumber TEXT,
      orderStatus TEXT NOT NULL DEFAULT 'New',
      notes TEXT,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      buyingPrice REAL NOT NULL,
      unitPrice REAL NOT NULL,
      totalPrice REAL NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS inventory_logs (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      previousStock INTEGER NOT NULL,
      newStock INTEGER NOT NULL,
      reference TEXT,
      notes TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT,
      paidBy TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      userName TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      companyName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      orderPrefix TEXT DEFAULT 'PBMS-ORD-',
      invoicePrefix TEXT DEFAULT 'PBMS-INV-',
      deliveryChargeInsideDhaka REAL DEFAULT 80,
      deliveryChargeOutsideDhaka REAL DEFAULT 150
    );`
  ];
}
