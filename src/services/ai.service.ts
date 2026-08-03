import { config } from '../config';

export async function generateAssistantReply(
  prompt: string,
  context?: any,
  systemContext?: string
): Promise<string> {
  const fullContextStr =
    typeof context === 'object'
      ? JSON.stringify(context, null, 2)
      : systemContext || 'অর্ডারের সামারি ও ইনভেন্টরি রেডি';

  const systemInstruction = `তুমি "${config.companyName} Business Management System (PBMS)"-এর অত্যন্ত দক্ষ ও বুদ্ধিমান বাংলা AI কাস্টমার ও বিজনেস অ্যাসিস্ট্যান্ট।
তোমার কাজ হলো ব্যবহারকারীকে তার ই-কমার্স ব্যবসার ডেটা বিশ্লেষণ, বিক্রির সুযোগ বৃদ্ধি, স্টক রিস্টক অ্যালার্ট, কাস্টমার মেসেজিং টেমপ্লেট ও লাভ-ক্ষতির গাণিতিক পরামর্শ দেওয়া।

রিয়েলটাইম ব্যবসার ডেটা সামারি:
${fullContextStr}

নির্দেশনাবলী:
১. সর্বদা অত্যন্ত মার্জিত, পেশাদার এবং সহজ বাংলায় উত্তর দেবে।
২. প্রয়োজনে পয়েন্ট আকারে (Bullet points / Bold headers) সুন্দরভাবে সাজিয়ে দেবে যাতে পড়তে সহজ হয়।
৩. কোনো কাস্টমার মেসেজ তৈরি করতে বললে সুন্দর অমায়িক টোন ব্যবহার করবে।
৪. বিক্রির নতুন ডিসকাউন্ট অফার, কুরিয়ার পরামর্শ এবং স্টক রিস্টক এনালাইসিস করে সরাসরি ব্যবহারযোগ্য পরামর্শ প্রদান করবে।`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.appUrl,
      'X-Title': `${config.companyName} Business AI`,
    },
    body: JSON.stringify({
      model: config.openRouterModel,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt || 'হাই' },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenRouter AI সহকারী প্রসেস করতে ব্যর্থ হয়েছে।');
  }

  return data.choices?.[0]?.message?.content || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
}

export async function parseOrderTextFromAi(
  rawText: string,
  availableProducts: any[] = []
): Promise<any> {
  const systemInstruction = `You are an expert AI order extraction system for "${config.companyName}", a Bangladeshi E-commerce business.
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
      "quantity": 1,
      "price": 500
    }
  ],
  "paymentMethod": "Must be one of: 'Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank'",
  "courier": "Must be one of: 'Pathao', 'Steadfast', 'RedX', 'Paperfly', 'Sundarban', 'Other'",
  "notes": "Any extra comments, e.g. bKash advance payment amount, delivery instruction, trxID, etc."
}
Return ONLY valid JSON without markdown tags or backticks.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.appUrl,
      'X-Title': `${config.companyName} Business AI Order Extractor`,
    },
    body: JSON.stringify({
      model: config.openRouterModel,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `অর্ডার টেক্সট প্রসেস করুন:\n\n${rawText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'অর্ডার টেক্সট প্রসেস করতে ব্যর্থ হয়েছে।');
  }

  let rawContent = data.choices?.[0]?.message?.content || '{}';
  rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

  return JSON.parse(rawContent);
}
