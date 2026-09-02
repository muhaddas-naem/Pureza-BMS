export interface DistrictItem {
  bn: string;
  en: string;
  altEn?: string[];
}

export const bdDistrictsList: DistrictItem[] = [
  { bn: 'ঢাকা', en: 'Dhaka', altEn: ['Dacca'] },
  { bn: 'চট্টগ্রাম', en: 'Chattogram', altEn: ['Chittagong'] },
  { bn: 'সিলেট', en: 'Sylhet' },
  { bn: 'রাজশাহী', en: 'Rajshahi' },
  { bn: 'খুলনা', en: 'Khulna' },
  { bn: 'বরিশাল', en: 'Barishal', altEn: ['Barisal'] },
  { bn: 'রংপুর', en: 'Rangpur' },
  { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
  { bn: 'গাজীপুর', en: 'Gazipur' },
  { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
  { bn: 'কুমিল্লা', en: 'Cumilla', altEn: ['Comilla'] },
  { bn: 'ফেনী', en: 'Feni' },
  { bn: 'নোয়াখালী', en: 'Noakhali' },
  { bn: 'বগুড়া', en: 'Bogura', altEn: ['Bogra'] },
  { bn: 'পাবনা', en: 'Pabna' },
  { bn: 'যশোর', en: 'Jashore', altEn: ['Jessore'] },
  { bn: 'দিনাজপুর', en: 'Dinajpur' },
  { bn: 'টাঙ্গাইল', en: 'Tangail' },
  { bn: 'কক্সবাজার', en: 'Cox\'s Bazar', altEn: ['Coxs Bazar', 'Coxbazar'] },
  { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' },
  { bn: 'কুষ্টিয়া', en: 'Kushtia' },
  { bn: 'ঝালকাঠি', en: 'Jhalokati', altEn: ['Jhalakathi'] },
  { bn: 'মেহেরপুর', en: 'Meherpur' },
  { bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' },
  { bn: 'ঝিনাইদহ', en: 'Jhenaidah' },
  { bn: 'মাগুরা', en: 'Magura' },
  { bn: 'সাতক্ষীরা', en: 'Satkhira' },
  { bn: 'বাগেরহাট', en: 'Bagerhat' },
  { bn: 'নড়াইল', en: 'Narail' },
  { bn: 'ফরিদপুর', en: 'Faridpur' },
  { bn: 'রাজবাড়ী', en: 'Rajbari' },
  { bn: 'গোপালগঞ্জ', en: 'Gopalganj' },
  { bn: 'মাদারীপুর', en: 'Madaripur' },
  { bn: 'শরীয়তপুর', en: 'Shariatpur' },
  { bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' },
  { bn: 'মানিকগঞ্জ', en: 'Manikganj' },
  { bn: 'মুন্সীগঞ্জ', en: 'Munshiganj' },
  { bn: 'নরসিংদী', en: 'Narsingdi' },
  { bn: 'শেরপুর', en: 'Sherpur' },
  { bn: 'জামালপুর', en: 'Jamalpur' },
  { bn: 'নেত্রকোণা', en: 'Netrokona', altEn: ['Netrakona'] },
  { bn: 'নাটোর', en: 'Natore' },
  { bn: 'নওগাঁ', en: 'Naogaon' },
  { bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj', altEn: ['Nawabganj'] },
  { bn: 'জয়পুরহাট', en: 'Joypurhat', altEn: ['Jaipurhat'] },
  { bn: 'সিরাজগঞ্জ', en: 'Sirajganj' },
  { bn: 'কুড়িগ্রাম', en: 'Kurigram' },
  { bn: 'লালমনিরহাট', en: 'Lalmonirhat' },
  { bn: 'নীলফামারী', en: 'Nilphamari' },
  { bn: 'পঞ্চগড়', en: 'Panchagarh' },
  { bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' },
  { bn: 'খাগড়াছড়ি', en: 'Khagrachhari' },
  { bn: 'রাঙ্গামাটি', en: 'Rangamati' },
  { bn: 'বান্দরবান', en: 'Bandarban' },
  { bn: 'চাঁদপুর', en: 'Chandpur' },
  { bn: 'লক্ষ্মীপুর', en: 'Lakshmipur', altEn: ['Laxmipur'] },
  { bn: 'ভোলা', en: 'Bhola' },
  { bn: 'পটুয়াখালী', en: 'Patuakhali' },
  { bn: 'পিরোজপুর', en: 'Pirojpur' },
  { bn: 'হবিগঞ্জ', en: 'Habiganj' },
  { bn: 'মৌলভীবাজার', en: 'Moulvibazar' },
  { bn: 'সুনামগঞ্জ', en: 'Sunamganj' },
  { bn: 'বরগুনা', en: 'Barguna' },
  { bn: 'গাইবান্ধা', en: 'Gaibandha' },
];

export function searchDistricts(query: string): DistrictItem[] {
  if (!query || !query.trim()) return bdDistrictsList;
  const q = query.trim().toLowerCase();
  return bdDistrictsList.filter((d) => {
    if (d.bn.toLowerCase().includes(q)) return true;
    if (d.en.toLowerCase().includes(q)) return true;
    if (d.altEn && d.altEn.some((alt) => alt.toLowerCase().includes(q))) return true;
    return false;
  });
}
