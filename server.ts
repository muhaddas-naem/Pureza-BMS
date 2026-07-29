import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Assistant endpoint
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY পাওয়া যায়নি। অনুগ্রহ করে Settings > Secrets প্যানেলে এপিআই কী যোগ করুন।',
        });
      }

      const { prompt, context, systemContext } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const fullContextStr = typeof context === 'object' 
        ? JSON.stringify(context, null, 2)
        : (systemContext || 'অর্ডারের সামারি ও ইনভেন্টরি রেডি');

      const systemInstruction = `তুমি "Pureza Business Management System (PBMS)"-এর অত্যন্ত দক্ষ ও বুদ্ধিমান বাংলা AI কাস্টমার ও বিজনেস অ্যাসিস্ট্যান্ট।
তোমার কাজ হলো ব্যবহারকারীকে তার ই-কমার্স ব্যবসার ডেটা বিশ্লেষণ, বিক্রির সুযোগ বৃদ্ধি, স্টক রিস্টক অ্যালার্ট, কাস্টমার মেসেজিং টেমপ্লেট ও লাভ-ক্ষতির গাণিতিক পরামর্শ দেওয়া।

রিয়েলটাইম ব্যবসার ডেটা সামারি:
${fullContextStr}

নির্দেশনাবলী:
১. সর্বদা অত্যন্ত মার্জিত, পেশাদার এবং সহজ বাংলায় উত্তর দেবে।
২. প্রয়োজনে পয়েন্ট আকারে (Bullet points / Bold headers) সুন্দরভাবে সাজিয়ে দেবে যাতে পড়তে সহজ হয়।
৩. কোনো কাস্টমার মেসেজ তৈরি করতে বললে সুন্দর অমায়িক টোন ব্যবহার করবে।
৪. বিক্রির নতুন ডিসকাউন্ট অফার, কুরিয়ার পরামর্শ এবং স্টক রিস্টক এনালাইসিস করে সরাসরি ব্যবহারযোগ্য পরামর্শ প্রদান করবে।`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
      return res.json({ text: replyText, reply: replyText });
    } catch (error: any) {
      console.error('Gemini Assistant Error:', error);
      return res.status(500).json({
        error: error?.message || 'AI সহকারী প্রসেস করতে ব্যর্থ হয়েছে।',
      });
    }
  });

  // Gemini Order Raw Text Parser (Bangla/English/Banglish to Order Fields)
  app.post('/api/ai/parse-order', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY পাওয়া যায়নি। অনুগ্রহ করে Settings > Secrets প্যানেলে এপিআই কী যোগ করুন।',
        });
      }

      const { rawText, availableProducts } = req.body;

      if (!rawText || !rawText.trim()) {
        return res.status(400).json({ error: 'টেক্সট ইনপুট ফাঁকা হতে পারে না।' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are an expert AI order extraction system for "Pureza", a Bangladeshi E-commerce business.
The user provides messy, unstructured customer text (in Bangla, English, or Banglish) copied from Facebook Messenger, WhatsApp, SMS, or phone notes.
Your goal is to extract order and customer details accurately into valid JSON.

Available store inventory products for exact matching:
${JSON.stringify(availableProducts || [], null, 2)}

You must return a strictly valid JSON object matching this schema:
{
  "customerName": "Customer full name in Bangla or English (default to 'গ্রাহক' if not mentioned)",
  "phone": "11-digit Bangladeshi phone number (e.g., '01712345678') convert Bengali numerals to English if needed",
  "altPhone": "Alternative phone number if any, else empty string ''",
  "district": "Bangla district name e.g., 'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'কুমিল্লা', 'খুলনা', 'বরিশাল', 'গাজীপুর' etc. (Default to 'ঢাকা' if inside Dhaka or unspecified)",
  "area": "Thana or area name in Bangla (e.g. 'ধানমন্ডি', 'মিরপুর', 'উত্তরা', 'চকবাজার', 'গুলশান') or empty string ''",
  "address": "Full delivery address string in Bangla or English",
  "items": [
    {
      "productName": "Extracted product name",
      "matchedProductId": "Matched exact 'id' string from available store products list if found, otherwise empty string ''",
      "quantity": 1 (numeric value, e.g. 1, 2, 0.5, 1.5, default to 1 if unspecified),
      "price": numeric selling price from matched product or extracted price
    }
  ],
  "paymentMethod": "Must be one of: 'Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank'",
  "courier": "Must be one of: 'Pathao', 'Steadfast', 'RedX', 'Paperfly', 'Sundarban', 'Other'",
  "notes": "Any extra comments, e.g. bKash advance payment amount, delivery instruction, trxID, etc."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `অর্ডার টেক্সট প্রসেস করুন:\n\n${rawText}`,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Gemini Order Parse Error:', error);
      return res.status(500).json({
        error: error?.message || 'অর্ডার টেক্সট বিশ্লেষণ করা সম্ভব হয়নি।',
      });
    }
  });

  // SQL Schema Export endpoint for PHP/MySQL users
  app.get('/api/db/export-sql', (req, res) => {
    const sqlSchema = `-- Pureza Business Management System (PBMS) - Core PHP & MySQL Schema DDL
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

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=pbms_database.sql');
    res.send(sqlSchema);
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PBMS Core Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
