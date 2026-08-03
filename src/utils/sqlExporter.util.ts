export function generateSqlSchema(): string {
  return `-- Pureza Business Management System (PBMS) - Core PHP & MySQL Schema DDL
-- Generated: ${new Date().toISOString()}

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS \`pbms_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`pbms_db\`;

-- 1. users table
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) UNIQUE NOT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('Admin', 'Manager', 'Staff') DEFAULT 'Staff',
  \`phone\` VARCHAR(20) NULL,
  \`status\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. categories table
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`status\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. products table
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`category_id\` INT NOT NULL,
  \`name\` VARCHAR(200) NOT NULL,
  \`sku\` VARCHAR(50) UNIQUE NOT NULL,
  \`barcode\` VARCHAR(50) NULL,
  \`buying_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`selling_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`current_stock\` INT NOT NULL DEFAULT 0,
  \`min_stock\` INT NOT NULL DEFAULT 5,
  \`image\` VARCHAR(255) NULL,
  \`description\` TEXT NULL,
  \`status\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. customers table
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL UNIQUE,
  \`alt_phone\` VARCHAR(20) NULL,
  \`district\` VARCHAR(50) NOT NULL,
  \`area\` VARCHAR(100) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`notes\` TEXT NULL,
  \`total_orders\` INT DEFAULT 0,
  \`total_spent\` DECIMAL(10,2) DEFAULT 0.00,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. orders table
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_number\` VARCHAR(50) UNIQUE NOT NULL,
  \`customer_id\` INT NOT NULL,
  \`order_date\` DATE NOT NULL,
  \`subtotal\` DECIMAL(10,2) NOT NULL,
  \`discount\` DECIMAL(10,2) DEFAULT 0.00,
  \`delivery_charge\` DECIMAL(10,2) DEFAULT 0.00,
  \`grand_total\` DECIMAL(10,2) NOT NULL,
  \`payment_method\` ENUM('bKash', 'Nagad', 'Rocket', 'Bank', 'Cash on Delivery') NOT NULL,
  \`payment_status\` ENUM('Paid', 'Unpaid', 'Partial') DEFAULT 'Unpaid',
  \`courier\` VARCHAR(50) NOT NULL,
  \`tracking_number\` VARCHAR(100) NULL,
  \`order_status\` ENUM('New', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'New',
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. order_items table
CREATE TABLE IF NOT EXISTS \`order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT NOT NULL,
  \`product_id\` INT NOT NULL,
  \`product_name\` VARCHAR(200) NOT NULL,
  \`quantity\` INT NOT NULL,
  \`buying_price\` DECIMAL(10,2) NOT NULL,
  \`unit_price\` DECIMAL(10,2) NOT NULL,
  \`total_price\` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. inventory logs table
CREATE TABLE IF NOT EXISTS \`inventory\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT NOT NULL,
  \`type\` ENUM('Stock In', 'Stock Out', 'Adjustment') NOT NULL,
  \`quantity\` INT NOT NULL,
  \`previous_stock\` INT NOT NULL,
  \`new_stock\` INT NOT NULL,
  \`reference\` VARCHAR(100) NULL,
  \`notes\` TEXT NULL,
  \`created_by\` VARCHAR(100) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. expense_categories table
CREATE TABLE IF NOT EXISTS \`expense_categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`status\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. expenses table
CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`category_id\` INT NOT NULL,
  \`expense_date\` DATE NOT NULL,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`description\` TEXT NULL,
  \`attachment\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`category_id\`) REFERENCES \`expense_categories\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. settings table
CREATE TABLE IF NOT EXISTS \`settings\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`company_name\` VARCHAR(150) NOT NULL DEFAULT 'Pureza',
  \`logo\` VARCHAR(255) NULL,
  \`phone\` VARCHAR(20) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`order_prefix\` VARCHAR(20) DEFAULT 'PBMS-ORD-',
  \`invoice_prefix\` VARCHAR(20) DEFAULT 'PBMS-INV-',
  \`delivery_charge_inside\` DECIMAL(10,2) DEFAULT 80.00,
  \`delivery_charge_outside\` DECIMAL(10,2) DEFAULT 150.00,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. activity_logs table
CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_name\` VARCHAR(100) NOT NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`details\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
`;
}
