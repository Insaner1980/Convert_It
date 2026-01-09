import { ConverterOption, KitchenIngredient, KitchenUnit, OvenMark, SizeRow, WorldCity } from '../types';

// --- Converter Data ---
export const LENGTH_UNITS: ConverterOption[] = [
  { id: 'm', label: 'Meters (m)', factor: 1 },
  { id: 'km', label: 'Kilometers (km)', factor: 1000 },
  { id: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
  { id: 'mm', label: 'Millimeters (mm)', factor: 0.001 },
  { id: 'in', label: 'Inches (in)', factor: 0.0254 },
  { id: 'ft', label: 'Feet (ft)', factor: 0.3048 },
  { id: 'yd', label: 'Yards (yd)', factor: 0.9144 },
  { id: 'mi', label: 'Miles (mi)', factor: 1609.34 },
];

export const WEIGHT_UNITS: ConverterOption[] = [
  { id: 'kg', label: 'Kilograms (kg)', factor: 1 },
  { id: 'g', label: 'Grams (g)', factor: 0.001 },
  { id: 'mg', label: 'Milligrams (mg)', factor: 0.000001 },
  { id: 'lb', label: 'Pounds (lb)', factor: 0.453592 },
  { id: 'oz', label: 'Ounces (oz)', factor: 0.0283495 },
];

export const TEMPERATURE_UNITS: ConverterOption[] = [
  { id: 'c', label: 'Celsius (°C)', factor: 1 },
  { id: 'f', label: 'Fahrenheit (°F)', factor: 1 },
];

export const DATA_UNITS: ConverterOption[] = [
  { id: 'b', label: 'Bytes (B)', factor: 1 },
  { id: 'kb', label: 'Kilobytes (KB)', factor: 1024 },
  { id: 'mb', label: 'Megabytes (MB)', factor: 1048576 }, // 1024^2
  { id: 'gb', label: 'Gigabytes (GB)', factor: 1073741824 }, // 1024^3
  { id: 'tb', label: 'Terabytes (TB)', factor: 1099511627776 }, // 1024^4
  { id: 'pb', label: 'Petabytes (PB)', factor: 1125899906842624 }, // 1024^5
  { id: 'bit', label: 'Bits (b)', factor: 0.125 }, // 1/8 byte
];

// --- Kitchen Data ---

// Base: Grams for Weight, Cups (US) for Volume
export const KITCHEN_UNITS: KitchenUnit[] = [
  // Weight
  { id: 'g', label: 'Grams (g)', type: 'weight', factor: 1 },
  { id: 'kg', label: 'Kilograms (kg)', type: 'weight', factor: 1000 },
  { id: 'oz', label: 'Ounces (oz)', type: 'weight', factor: 28.3495 },
  { id: 'lb', label: 'Pounds (lb)', type: 'weight', factor: 453.592 },

  // Volume (Base = 1 Cup US ~ 236.59ml)
  { id: 'cup', label: 'Cups (US)', type: 'volume', factor: 1 },
  { id: 'dl', label: 'Deciliters (dl)', type: 'volume', factor: 0.422675 }, // 1 dl = 100ml -> 100/236.59 cups
  { id: 'ml', label: 'Milliliters (ml)', type: 'volume', factor: 0.00422675 },
  { id: 'l', label: 'Liters (l)', type: 'volume', factor: 4.22675 },
  { id: 'tbsp', label: 'Tablespoons', type: 'volume', factor: 0.0625 }, // 1/16 cup
  { id: 'tsp', label: 'Teaspoons', type: 'volume', factor: 0.0208333 }, // 1/48 cup
  { id: 'fl_oz', label: 'Fluid Ounces (US)', type: 'volume', factor: 0.125 }, // 1/8 cup
  { id: 'pt_us', label: 'Pints (US)', type: 'volume', factor: 2 },
  { id: 'qt_us', label: 'Quarts (US)', type: 'volume', factor: 4 },
  { id: 'gal_us', label: 'Gallons (US)', type: 'volume', factor: 16 },
  { id: 'pt_uk', label: 'Pints (UK)', type: 'volume', factor: 2.4019 }, // Imperial Pint ~ 568ml

  // Discrete (Butter)
  { id: 'stick', label: 'Stick (Butter)', type: 'discrete', factor: 113.4 }, // treated as grams for calc
];

export const INGREDIENTS: KitchenIngredient[] = [
  // General / Generic
  { id: 'water', name: 'No Ingredient', category: 'General', density: 236.59 },

  // Flours
  { id: 'flour_ap', name: 'Flour, All-Purpose (US)', category: 'Flours', density: 125 },
  { id: 'flour_plain_uk', name: 'Flour, Plain (UK)', category: 'Flours', density: 130 },
  { id: 'flour_bread', name: 'Flour, Bread', category: 'Flours', density: 127 },
  { id: 'flour_cake', name: 'Flour, Cake', category: 'Flours', density: 114 },
  { id: 'flour_whole', name: 'Flour, Whole Wheat', category: 'Flours', density: 120 },
  { id: 'flour_sr_us', name: 'Flour, Self-Rising (US)', category: 'Flours', density: 125 },
  { id: 'flour_sr_uk', name: 'Flour, Self-Raising (UK)', category: 'Flours', density: 140 }, // often denser packing
  { id: 'flour_almond', name: 'Flour, Almond', category: 'Flours', density: 96 },
  { id: 'flour_coconut', name: 'Flour, Coconut', category: 'Flours', density: 112 },
  { id: 'flour_rye', name: 'Flour, Rye', category: 'Flours', density: 102 },

  // Sugars
  { id: 'sugar_granulated', name: 'Sugar, White Granulated', category: 'Sugars', density: 200 },
  { id: 'sugar_brown_packed', name: 'Sugar, Brown (Packed)', category: 'Sugars', density: 220 },
  { id: 'sugar_brown_loose', name: 'Sugar, Brown (Loose)', category: 'Sugars', density: 145 },
  { id: 'sugar_caster', name: 'Sugar, Caster/Superfine', category: 'Sugars', density: 225 },
  { id: 'sugar_powdered', name: 'Sugar, Powdered/Icing', category: 'Sugars', density: 120 },
  { id: 'honey', name: 'Honey', category: 'Sugars', density: 340 },
  { id: 'syrup_maple', name: 'Maple Syrup', category: 'Sugars', density: 312 },
  { id: 'syrup_corn', name: 'Corn Syrup', category: 'Sugars', density: 328 },
  { id: 'molasses', name: 'Molasses', category: 'Sugars', density: 335 },

  // Fats & Dairy
  { id: 'butter', name: 'Butter (Regular)', category: 'Fats & Dairy', density: 227 },
  { id: 'oil', name: 'Vegetable/Olive Oil', category: 'Fats & Dairy', density: 218 },
  { id: 'shortening', name: 'Vegetable Shortening', category: 'Fats & Dairy', density: 205 },
  { id: 'lard', name: 'Lard', category: 'Fats & Dairy', density: 215 },
  { id: 'milk', name: 'Milk', category: 'Fats & Dairy', density: 245 },
  { id: 'buttermilk', name: 'Buttermilk', category: 'Fats & Dairy', density: 245 },
  { id: 'cream_heavy', name: 'Cream, Heavy', category: 'Fats & Dairy', density: 235 },
  { id: 'cream_sour', name: 'Sour Cream', category: 'Fats & Dairy', density: 240 },
  { id: 'yogurt', name: 'Yogurt', category: 'Fats & Dairy', density: 245 },
  { id: 'mascarpone', name: 'Mascarpone', category: 'Fats & Dairy', density: 225 },

  // Grains & Dry Goods
  { id: 'rice_uncooked', name: 'Rice (Uncooked)', category: 'Grains', density: 185 },
  { id: 'rice_basmati', name: 'Rice, Basmati', category: 'Grains', density: 195 },
  { id: 'oats_rolled', name: 'Oats, Rolled (Old Fashioned)', category: 'Grains', density: 90 },
  { id: 'oats_quick', name: 'Oats, Quick', category: 'Grains', density: 105 },
  { id: 'couscous', name: 'Couscous', category: 'Grains', density: 175 },
  { id: 'quinoa', name: 'Quinoa (Uncooked)', category: 'Grains', density: 170 },
  { id: 'breadcrumbs_dry', name: 'Breadcrumbs (Dry)', category: 'Grains', density: 125 },
  { id: 'breadcrumbs_panko', name: 'Breadcrumbs (Panko)', category: 'Grains', density: 60 },

  // Baking Essentials
  { id: 'cocoa', name: 'Cocoa Powder', category: 'Baking', density: 85 },
  { id: 'cornstarch', name: 'Cornstarch / Cornflour', category: 'Baking', density: 128 },
  { id: 'salt_table', name: 'Salt, Table', category: 'Baking', density: 273 },
  { id: 'salt_kosher_morton', name: 'Salt, Kosher (Morton)', category: 'Baking', density: 240 },
  { id: 'salt_kosher_diamond', name: 'Salt, Kosher (Diamond)', category: 'Baking', density: 145 },
  { id: 'baking_powder', name: 'Baking Powder', category: 'Baking', density: 192 },
  { id: 'baking_soda', name: 'Baking Soda', category: 'Baking', density: 220 },

  // Add-ins
  { id: 'choc_chips', name: 'Chocolate Chips', category: 'Add-ins', density: 170 },
  { id: 'nuts_chopped', name: 'Nuts (Chopped)', category: 'Add-ins', density: 120 },
  { id: 'nuts_ground', name: 'Nuts (Ground)', category: 'Add-ins', density: 95 },
  { id: 'raisins', name: 'Raisins / Dried Fruit', category: 'Add-ins', density: 160 },
  { id: 'blueberries', name: 'Blueberries (Fresh)', category: 'Add-ins', density: 155 },
  { id: 'cheese_shredded', name: 'Cheese (Shredded)', category: 'Add-ins', density: 115 },
  { id: 'cheese_parm', name: 'Parmesan (Grated)', category: 'Add-ins', density: 100 },
];

export const OVEN_MARKS: OvenMark[] = [
  { gas: '1/4', c: 110, f: 225 },
  { gas: '1/2', c: 130, f: 250 },
  { gas: '1', c: 140, f: 275 },
  { gas: '2', c: 150, f: 300 },
  { gas: '3', c: 170, f: 325 },
  { gas: '4', c: 180, f: 350 },
  { gas: '5', c: 190, f: 375 },
  { gas: '6', c: 200, f: 400 },
  { gas: '7', c: 220, f: 425 },
  { gas: '8', c: 230, f: 450 },
  { gas: '9', c: 240, f: 475 },
];

// --- Size Data ---

// SHOES
export const SHOE_SIZES_MEN: SizeRow[] = [
  { label: '40', eu: '40', us: '7', uk: '6', cm: '25' },
  { label: '41', eu: '41', us: '8', uk: '7', cm: '26' },
  { label: '42', eu: '42', us: '8.5', uk: '7.5', cm: '26.5' },
  { label: '43', eu: '43', us: '9.5', uk: '8.5', cm: '27.5' },
  { label: '44', eu: '44', us: '10', uk: '9', cm: '28' },
  { label: '45', eu: '45', us: '11', uk: '10', cm: '29' },
  { label: '46', eu: '46', us: '12', uk: '11', cm: '30' },
  { label: '47', eu: '47', us: '13', uk: '12', cm: '31' },
];

export const SHOE_SIZES_WOMEN: SizeRow[] = [
  { label: '35', eu: '35', us: '5', uk: '2.5', cm: '22' },
  { label: '36', eu: '36', us: '6', uk: '3.5', cm: '23' },
  { label: '37', eu: '37', us: '6.5', uk: '4', cm: '23.5' },
  { label: '38', eu: '38', us: '7.5', uk: '5', cm: '24' },
  { label: '39', eu: '39', us: '8.5', uk: '6', cm: '25' },
  { label: '40', eu: '40', us: '9', uk: '6.5', cm: '25.5' },
  { label: '41', eu: '41', us: '9.5', uk: '7', cm: '26' },
  { label: '42', eu: '42', us: '10', uk: '7.5', cm: '26.5' },
];

export const SHOE_SIZES_KIDS: SizeRow[] = [
  { label: '20', eu: '20', us: '4.5C', uk: '3.5', cm: '12' },
  { label: '22', eu: '22', us: '6C', uk: '5', cm: '13.5' },
  { label: '24', eu: '24', us: '8C', uk: '7', cm: '15' },
  { label: '26', eu: '26', us: '9.5C', uk: '8.5', cm: '16.5' },
  { label: '28', eu: '28', us: '11C', uk: '10', cm: '17.5' },
  { label: '30', eu: '30', us: '12.5C', uk: '11.5', cm: '18.5' },
  { label: '32', eu: '32', us: '1Y', uk: '13', cm: '20' },
  { label: '34', eu: '34', us: '2.5Y', uk: '1.5', cm: '21.5' },
];

// CLOTHING - WOMEN
export const CLOTHING_WOMEN_TOPS: SizeRow[] = [
  { label: 'XS', eu: '32-34', us: '0-2', uk: '4-6', it: '38' },
  { label: 'S', eu: '36-38', us: '4-6', uk: '8-10', it: '40' },
  { label: 'M', eu: '40-42', us: '8-10', uk: '12-14', it: '44' },
  { label: 'L', eu: '44-46', us: '12-14', uk: '16-18', it: '48' },
  { label: 'XL', eu: '48-50', us: '16-18', uk: '20-22', it: '52' },
  { label: 'XXL', eu: '52-54', us: '20-22', uk: '24-26', it: '56' },
];

export const CLOTHING_WOMEN_BOTTOMS: SizeRow[] = [
  { label: 'XS', eu: '34', us: '24-25"', uk: '6', cm: '60-64' },
  { label: 'S', eu: '36', us: '26-27"', uk: '8', cm: '65-69' },
  { label: 'M', eu: '38', us: '28-29"', uk: '10', cm: '70-74' },
  { label: 'L', eu: '40', us: '30-32"', uk: '12', cm: '75-80' },
  { label: 'XL', eu: '42', us: '33-35"', uk: '14', cm: '81-86' },
];

// CLOTHING - MEN
export const CLOTHING_MEN_TOPS: SizeRow[] = [
  { label: 'S', eu: '46', us: '36', uk: '36', cm: '90-95' },
  { label: 'M', eu: '48', us: '38', uk: '38', cm: '96-101' },
  { label: 'L', eu: '50', us: '40', uk: '40', cm: '102-107' },
  { label: 'XL', eu: '52', us: '42', uk: '42', cm: '108-113' },
  { label: 'XXL', eu: '54', us: '44', uk: '44', cm: '114-119' },
  { label: '3XL', eu: '56', us: '46', uk: '46', cm: '120-125' },
];

export const CLOTHING_MEN_PANTS: SizeRow[] = [
  { label: 'XS', eu: '42', us: '28"', uk: '28', cm: '71' },
  { label: 'S', eu: '44', us: '30"', uk: '30', cm: '76' },
  { label: 'M', eu: '46', us: '32"', uk: '32', cm: '81' },
  { label: 'L', eu: '48', us: '34"', uk: '34', cm: '86' },
  { label: 'XL', eu: '52', us: '36"', uk: '36', cm: '91.5' },
  { label: 'XXL', eu: '54', us: '38"', uk: '38', cm: '96.5' },
];

// CLOTHING - KIDS
export const CLOTHING_KIDS: SizeRow[] = [
  { label: '0-3m', eu: '56', us: '0-3M', cm: '50-56', uk: '0-3' },
  { label: '3-6m', eu: '62', us: '3-6M', cm: '57-62', uk: '3-6' },
  { label: '6-9m', eu: '68', us: '6-9M', cm: '63-68', uk: '6-9' },
  { label: '9-12m', eu: '74', us: '9-12M', cm: '69-74', uk: '9-12' },
  { label: '1-1.5y', eu: '80', us: '12-18M', cm: '75-80', uk: '1y' },
  { label: '1.5-2y', eu: '86', us: '2T', cm: '81-86', uk: '2y' },
  { label: '3-4y', eu: '98-104', us: '4T', cm: '98-104', uk: '3-4y' },
  { label: '5-6y', eu: '110-116', us: '5-6', cm: '110-116', uk: '5-6y' },
  { label: '7-8y', eu: '122-128', us: '7-8', cm: '122-128', uk: '7-8y' },
  { label: '9-10y', eu: '134-140', us: '10', cm: '134-140', uk: '9-10y' },
];

// BRA DATA
export const BRA_BANDS_EU = [65, 70, 75, 80, 85, 90, 95, 100, 105];
export const BRA_CUPS_EU = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Maps EU Band to others
export const BRA_BAND_MAP: Record<number, { us: number; fr: number; au: number }> = {
  60: { us: 28, fr: 75, au: 6 },
  65: { us: 30, fr: 80, au: 8 },
  70: { us: 32, fr: 85, au: 10 },
  75: { us: 34, fr: 90, au: 12 },
  80: { us: 36, fr: 95, au: 14 },
  85: { us: 38, fr: 100, au: 16 },
  90: { us: 40, fr: 105, au: 18 },
  95: { us: 42, fr: 110, au: 20 },
  100: { us: 44, fr: 115, au: 22 },
  105: { us: 46, fr: 120, au: 24 },
};

// Simplified Cup Map (Approximation)
export const BRA_CUP_MAP: Record<string, { us: string; uk: string }> = {
  'AA': { us: 'AA', uk: 'AA' },
  'A': { us: 'A', uk: 'A' },
  'B': { us: 'B', uk: 'B' },
  'C': { us: 'C', uk: 'C' },
  'D': { us: 'D', uk: 'D' },
  'E': { us: 'DD/E', uk: 'DD' },
  'F': { us: 'DDD/F', uk: 'E' },
  'G': { us: 'G', uk: 'F' },
  'H': { us: 'H', uk: 'FF' },
};

// Currency - Static info (symbols, names). Rates fetched from ExchangeRate-API.
// Contains 160+ currencies. Common ones have symbols, others use code as symbol.
export const CURRENCY_INFO: Record<string, { name: string; symbol: string }> = {
  // Major currencies
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  // Nordic
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr' },
  DKK: { name: 'Danish Krone', symbol: 'kr' },
  ISK: { name: 'Icelandic Króna', symbol: 'kr' },
  // European
  PLN: { name: 'Polish Złoty', symbol: 'zł' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
  RON: { name: 'Romanian Leu', symbol: 'lei' },
  BGN: { name: 'Bulgarian Lev', symbol: 'лв' },
  HRK: { name: 'Croatian Kuna', symbol: 'kn' },
  RSD: { name: 'Serbian Dinar', symbol: 'дин' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴' },
  RUB: { name: 'Russian Ruble', symbol: '₽' },
  // Middle East
  AED: { name: 'UAE Dirham', symbol: 'د.إ' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼' },
  ILS: { name: 'Israeli Shekel', symbol: '₪' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  QAR: { name: 'Qatari Riyal', symbol: 'ر.ق' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  BHD: { name: 'Bahraini Dinar', symbol: 'د.ب' },
  OMR: { name: 'Omani Rial', symbol: 'ر.ع' },
  JOD: { name: 'Jordanian Dinar', symbol: 'د.ا' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£' },
  // Asia
  INR: { name: 'Indian Rupee', symbol: '₹' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  PHP: { name: 'Philippine Peso', symbol: '₱' },
  THB: { name: 'Thai Baht', symbol: '฿' },
  VND: { name: 'Vietnamese Dong', symbol: '₫' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  TWD: { name: 'Taiwan Dollar', symbol: 'NT$' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳' },
  LKR: { name: 'Sri Lankan Rupee', symbol: 'Rs' },
  NPR: { name: 'Nepalese Rupee', symbol: '₨' },
  MMK: { name: 'Myanmar Kyat', symbol: 'K' },
  KHR: { name: 'Cambodian Riel', symbol: '៛' },
  // Americas
  MXN: { name: 'Mexican Peso', symbol: 'Mex$' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  ARS: { name: 'Argentine Peso', symbol: 'AR$' },
  CLP: { name: 'Chilean Peso', symbol: 'CL$' },
  COP: { name: 'Colombian Peso', symbol: 'CO$' },
  PEN: { name: 'Peruvian Sol', symbol: 'S/' },
  UYU: { name: 'Uruguayan Peso', symbol: '$U' },
  // Africa
  ZAR: { name: 'South African Rand', symbol: 'R' },
  NGN: { name: 'Nigerian Naira', symbol: '₦' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵' },
  MAD: { name: 'Moroccan Dirham', symbol: 'د.م' },
  TND: { name: 'Tunisian Dinar', symbol: 'د.ت' },
  // Other
  BTC: { name: 'Bitcoin', symbol: '₿' },
};

// Default currencies to show (user can customize later)
export const DEFAULT_CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'SEK', 'NOK', 'CHF', 'CAD', 'AUD', 'CNY'];

// Tools: Cities (The starting list)
export const WORLD_CITIES: WorldCity[] = [
  // 1. Helsinki
  { id: 'helsinki', name: 'Helsinki', region: 'Finland', timezone: 'Europe/Helsinki' },
  // 2. Europe
  { id: 'london', name: 'London', region: 'UK', timezone: 'Europe/London' },
  { id: 'paris', name: 'Paris', region: 'France', timezone: 'Europe/Paris' },
  // 3. USA
  { id: 'nyc', name: 'New York', region: 'USA', timezone: 'America/New_York' },
  { id: 'la', name: 'Los Angeles', region: 'USA', timezone: 'America/Los_Angeles' },
  // 4. Rest of World
  { id: 'tokyo', name: 'Tokyo', region: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'sydney', name: 'Sydney', region: 'Australia', timezone: 'Australia/Sydney' },
  { id: 'dubai', name: 'Dubai', region: 'UAE', timezone: 'Asia/Dubai' },
  { id: 'singapore', name: 'Singapore', region: 'Singapore', timezone: 'Asia/Singapore' },
];

// Expanded pool for adding cities
export const ALL_CITIES: WorldCity[] = [
  // --- NORDICS & FINLAND ---
  { id: 'helsinki', name: 'Helsinki', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'tampere', name: 'Tampere', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'turku', name: 'Turku', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'oulu', name: 'Oulu', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'rovaniemi', name: 'Rovaniemi', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'jyvaskyla', name: 'Jyväskylä', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'kuopio', name: 'Kuopio', region: 'Finland', timezone: 'Europe/Helsinki' },
  { id: 'stockholm', name: 'Stockholm', region: 'Sweden', timezone: 'Europe/Stockholm' },
  { id: 'gothenburg', name: 'Gothenburg', region: 'Sweden', timezone: 'Europe/Stockholm' },
  { id: 'malmo', name: 'Malmö', region: 'Sweden', timezone: 'Europe/Stockholm' },
  { id: 'oslo', name: 'Oslo', region: 'Norway', timezone: 'Europe/Oslo' },
  { id: 'bergen', name: 'Bergen', region: 'Norway', timezone: 'Europe/Oslo' },
  { id: 'copenhagen', name: 'Copenhagen', region: 'Denmark', timezone: 'Europe/Copenhagen' },
  { id: 'aarhus', name: 'Aarhus', region: 'Denmark', timezone: 'Europe/Copenhagen' },
  { id: 'iceland', name: 'Reykjavik', region: 'Iceland', timezone: 'Atlantic/Reykjavik' },

  // --- EUROPE (Major + Holiday) ---
  { id: 'london', name: 'London', region: 'UK', timezone: 'Europe/London' },
  { id: 'manchester', name: 'Manchester', region: 'UK', timezone: 'Europe/London' },
  { id: 'edinburgh', name: 'Edinburgh', region: 'UK', timezone: 'Europe/London' },
  { id: 'dublin', name: 'Dublin', region: 'Ireland', timezone: 'Europe/Dublin' },
  { id: 'paris', name: 'Paris', region: 'France', timezone: 'Europe/Paris' },
  { id: 'lyon', name: 'Lyon', region: 'France', timezone: 'Europe/Paris' },
  { id: 'nice', name: 'Nice', region: 'France', timezone: 'Europe/Paris' },
  { id: 'berlin', name: 'Berlin', region: 'Germany', timezone: 'Europe/Berlin' },
  { id: 'munich', name: 'Munich', region: 'Germany', timezone: 'Europe/Berlin' },
  { id: 'hamburg', name: 'Hamburg', region: 'Germany', timezone: 'Europe/Berlin' },
  { id: 'frankfurt', name: 'Frankfurt', region: 'Germany', timezone: 'Europe/Berlin' },
  { id: 'rome', name: 'Rome', region: 'Italy', timezone: 'Europe/Rome' },
  { id: 'milan', name: 'Milan', region: 'Italy', timezone: 'Europe/Rome' },
  { id: 'venice', name: 'Venice', region: 'Italy', timezone: 'Europe/Rome' },
  { id: 'naples', name: 'Naples', region: 'Italy', timezone: 'Europe/Rome' },
  { id: 'madrid', name: 'Madrid', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'barcelona', name: 'Barcelona', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'malaga', name: 'Málaga', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'alicante', name: 'Alicante', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'torrevieja', name: 'Torrevieja', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'palma', name: 'Palma de Mallorca', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'ibiza', name: 'Ibiza', region: 'Spain', timezone: 'Europe/Madrid' },
  { id: 'laspalmas', name: 'Las Palmas (Gran Canaria)', region: 'Spain', timezone: 'Atlantic/Canary' },
  { id: 'tenerife', name: 'Santa Cruz (Tenerife)', region: 'Spain', timezone: 'Atlantic/Canary' },
  { id: 'lisbon', name: 'Lisbon', region: 'Portugal', timezone: 'Europe/Lisbon' },
  { id: 'porto', name: 'Porto', region: 'Portugal', timezone: 'Europe/Lisbon' },
  { id: 'amsterdam', name: 'Amsterdam', region: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { id: 'rotterdam', name: 'Rotterdam', region: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { id: 'brussels', name: 'Brussels', region: 'Belgium', timezone: 'Europe/Brussels' },
  { id: 'vienna', name: 'Vienna', region: 'Austria', timezone: 'Europe/Vienna' },
  { id: 'zurich', name: 'Zurich', region: 'Switzerland', timezone: 'Europe/Zurich' },
  { id: 'geneva', name: 'Geneva', region: 'Switzerland', timezone: 'Europe/Zurich' },
  { id: 'prague', name: 'Prague', region: 'Czech Republic', timezone: 'Europe/Prague' },
  { id: 'budapest', name: 'Budapest', region: 'Hungary', timezone: 'Europe/Budapest' },
  { id: 'warsaw', name: 'Warsaw', region: 'Poland', timezone: 'Europe/Warsaw' },
  { id: 'krakow', name: 'Krakow', region: 'Poland', timezone: 'Europe/Warsaw' },
  { id: 'athens', name: 'Athens', region: 'Greece', timezone: 'Europe/Athens' },
  { id: 'rhodes', name: 'Rhodes', region: 'Greece', timezone: 'Europe/Athens' },
  { id: 'crete', name: 'Heraklion (Crete)', region: 'Greece', timezone: 'Europe/Athens' },
  { id: 'istanbul', name: 'Istanbul', region: 'Turkey', timezone: 'Europe/Istanbul' },
  { id: 'antalya', name: 'Antalya', region: 'Turkey', timezone: 'Europe/Istanbul' },
  { id: 'kyiv', name: 'Kyiv', region: 'Ukraine', timezone: 'Europe/Kyiv' },
  { id: 'moscow', name: 'Moscow', region: 'Russia', timezone: 'Europe/Moscow' },
  { id: 'stpetersburg', name: 'St. Petersburg', region: 'Russia', timezone: 'Europe/Moscow' },
  { id: 'tallinn', name: 'Tallinn', region: 'Estonia', timezone: 'Europe/Tallinn' },
  { id: 'riga', name: 'Riga', region: 'Latvia', timezone: 'Europe/Riga' },
  { id: 'vilnius', name: 'Vilnius', region: 'Lithuania', timezone: 'Europe/Vilnius' },
  { id: 'bucharest', name: 'Bucharest', region: 'Romania', timezone: 'Europe/Bucharest' },
  { id: 'sofia', name: 'Sofia', region: 'Bulgaria', timezone: 'Europe/Sofia' },
  { id: 'belgrade', name: 'Belgrade', region: 'Serbia', timezone: 'Europe/Belgrade' },
  { id: 'zagreb', name: 'Zagreb', region: 'Croatia', timezone: 'Europe/Zagreb' },
  { id: 'dubrovnik', name: 'Dubrovnik', region: 'Croatia', timezone: 'Europe/Zagreb' },
  { id: 'split', name: 'Split', region: 'Croatia', timezone: 'Europe/Zagreb' },

  // --- NORTH AMERICA (USA & Canada) ---
  { id: 'nyc', name: 'New York', region: 'USA', timezone: 'America/New_York' },
  { id: 'la', name: 'Los Angeles', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'chicago', name: 'Chicago', region: 'USA', timezone: 'America/Chicago' },
  { id: 'houston', name: 'Houston', region: 'USA', timezone: 'America/Chicago' },
  { id: 'phoenix', name: 'Phoenix', region: 'USA', timezone: 'America/Phoenix' },
  { id: 'philadelphia', name: 'Philadelphia', region: 'USA', timezone: 'America/New_York' },
  { id: 'sanantonio', name: 'San Antonio', region: 'USA', timezone: 'America/Chicago' },
  { id: 'sandiego', name: 'San Diego', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'dallas', name: 'Dallas', region: 'USA', timezone: 'America/Chicago' },
  { id: 'sanjose', name: 'San Jose', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'austin', name: 'Austin', region: 'USA', timezone: 'America/Chicago' },
  { id: 'jacksonville', name: 'Jacksonville', region: 'USA', timezone: 'America/New_York' },
  { id: 'sf', name: 'San Francisco', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'columbus', name: 'Columbus', region: 'USA', timezone: 'America/New_York' },
  { id: 'indianapolis', name: 'Indianapolis', region: 'USA', timezone: 'America/Indiana/Indianapolis' },
  { id: 'seattle', name: 'Seattle', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'denver', name: 'Denver', region: 'USA', timezone: 'America/Denver' },
  { id: 'dc', name: 'Washington D.C.', region: 'USA', timezone: 'America/New_York' },
  { id: 'boston', name: 'Boston', region: 'USA', timezone: 'America/New_York' },
  { id: 'nashville', name: 'Nashville', region: 'USA', timezone: 'America/Chicago' },
  { id: 'detroit', name: 'Detroit', region: 'USA', timezone: 'America/Detroit' },
  { id: 'portland', name: 'Portland', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'lasvegas', name: 'Las Vegas', region: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'miami', name: 'Miami', region: 'USA', timezone: 'America/New_York' },
  { id: 'orlando', name: 'Orlando', region: 'USA', timezone: 'America/New_York' },
  { id: 'atlanta', name: 'Atlanta', region: 'USA', timezone: 'America/New_York' },
  { id: 'neworleans', name: 'New Orleans', region: 'USA', timezone: 'America/Chicago' },
  { id: 'hawaii', name: 'Honolulu', region: 'USA', timezone: 'Pacific/Honolulu' },
  { id: 'anchorage', name: 'Anchorage', region: 'USA', timezone: 'America/Anchorage' },
  { id: 'toronto', name: 'Toronto', region: 'Canada', timezone: 'America/Toronto' },
  { id: 'montreal', name: 'Montreal', region: 'Canada', timezone: 'America/Toronto' },
  { id: 'vancouver', name: 'Vancouver', region: 'Canada', timezone: 'America/Vancouver' },
  { id: 'calgary', name: 'Calgary', region: 'Canada', timezone: 'America/Edmonton' },
  { id: 'ottawa', name: 'Ottawa', region: 'Canada', timezone: 'America/Toronto' },
  { id: 'mexico', name: 'Mexico City', region: 'Mexico', timezone: 'America/Mexico_City' },
  { id: 'cancun', name: 'Cancun', region: 'Mexico', timezone: 'America/Cancun' },

  // --- SOUTH AMERICA ---
  { id: 'saopaulo', name: 'Sao Paulo', region: 'Brazil', timezone: 'America/Sao_Paulo' },
  { id: 'rio', name: 'Rio de Janeiro', region: 'Brazil', timezone: 'America/Sao_Paulo' },
  { id: 'buenosaires', name: 'Buenos Aires', region: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { id: 'santiago', name: 'Santiago', region: 'Chile', timezone: 'America/Santiago' },
  { id: 'bogota', name: 'Bogota', region: 'Colombia', timezone: 'America/Bogota' },
  { id: 'lima', name: 'Lima', region: 'Peru', timezone: 'America/Lima' },
  { id: 'caracas', name: 'Caracas', region: 'Venezuela', timezone: 'America/Caracas' },
  { id: 'quito', name: 'Quito', region: 'Ecuador', timezone: 'America/Guayaquil' },
  { id: 'montevideo', name: 'Montevideo', region: 'Uruguay', timezone: 'America/Montevideo' },
  { id: 'lapaz', name: 'La Paz', region: 'Bolivia', timezone: 'America/La_Paz' },

  // --- ASIA & MIDDLE EAST ---
  { id: 'tokyo', name: 'Tokyo', region: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'osaka', name: 'Osaka', region: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'kyoto', name: 'Kyoto', region: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'seoul', name: 'Seoul', region: 'South Korea', timezone: 'Asia/Seoul' },
  { id: 'busan', name: 'Busan', region: 'South Korea', timezone: 'Asia/Seoul' },
  { id: 'beijing', name: 'Beijing', region: 'China', timezone: 'Asia/Shanghai' },
  { id: 'shanghai', name: 'Shanghai', region: 'China', timezone: 'Asia/Shanghai' },
  { id: 'guangzhou', name: 'Guangzhou', region: 'China', timezone: 'Asia/Shanghai' },
  { id: 'shenzhen', name: 'Shenzhen', region: 'China', timezone: 'Asia/Shanghai' },
  { id: 'hongkong', name: 'Hong Kong', region: 'China', timezone: 'Asia/Hong_Kong' },
  { id: 'taipei', name: 'Taipei', region: 'Taiwan', timezone: 'Asia/Taipei' },
  { id: 'bangkok', name: 'Bangkok', region: 'Thailand', timezone: 'Asia/Bangkok' },
  { id: 'phuket', name: 'Phuket', region: 'Thailand', timezone: 'Asia/Bangkok' },
  { id: 'chiangmai', name: 'Chiang Mai', region: 'Thailand', timezone: 'Asia/Bangkok' },
  { id: 'hanoi', name: 'Hanoi', region: 'Vietnam', timezone: 'Asia/Bangkok' },
  { id: 'hochiminh', name: 'Ho Chi Minh City', region: 'Vietnam', timezone: 'Asia/Bangkok' },
  { id: 'phnompenh', name: 'Phnom Penh', region: 'Cambodia', timezone: 'Asia/Phnom_Penh' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', region: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { id: 'singapore', name: 'Singapore', region: 'Singapore', timezone: 'Asia/Singapore' },
  { id: 'jakarta', name: 'Jakarta', region: 'Indonesia', timezone: 'Asia/Jakarta' },
  { id: 'bali', name: 'Bali (Denpasar)', region: 'Indonesia', timezone: 'Asia/Makassar' },
  { id: 'manila', name: 'Manila', region: 'Philippines', timezone: 'Asia/Manila' },
  { id: 'cebu', name: 'Cebu', region: 'Philippines', timezone: 'Asia/Manila' },
  { id: 'mumbai', name: 'Mumbai', region: 'India', timezone: 'Asia/Kolkata' },
  { id: 'delhi', name: 'New Delhi', region: 'India', timezone: 'Asia/Kolkata' },
  { id: 'bangalore', name: 'Bangalore', region: 'India', timezone: 'Asia/Kolkata' },
  { id: 'chennai', name: 'Chennai', region: 'India', timezone: 'Asia/Kolkata' },
  { id: 'kolkata', name: 'Kolkata', region: 'India', timezone: 'Asia/Kolkata' },
  { id: 'karachi', name: 'Karachi', region: 'Pakistan', timezone: 'Asia/Karachi' },
  { id: 'dhaka', name: 'Dhaka', region: 'Bangladesh', timezone: 'Asia/Dhaka' },
  { id: 'kathmandu', name: 'Kathmandu', region: 'Nepal', timezone: 'Asia/Kathmandu' },
  { id: 'dubai', name: 'Dubai', region: 'UAE', timezone: 'Asia/Dubai' },
  { id: 'abudhabi', name: 'Abu Dhabi', region: 'UAE', timezone: 'Asia/Dubai' },
  { id: 'doha', name: 'Doha', region: 'Qatar', timezone: 'Asia/Qatar' },
  { id: 'riyadh', name: 'Riyadh', region: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  { id: 'jeddah', name: 'Jeddah', region: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  { id: 'telaviv', name: 'Tel Aviv', region: 'Israel', timezone: 'Asia/Jerusalem' },
  { id: 'jerusalem', name: 'Jerusalem', region: 'Israel', timezone: 'Asia/Jerusalem' },
  { id: 'tehran', name: 'Tehran', region: 'Iran', timezone: 'Asia/Tehran' },
  { id: 'baghdad', name: 'Baghdad', region: 'Iraq', timezone: 'Asia/Baghdad' },

  // --- OCEANIA ---
  { id: 'sydney', name: 'Sydney', region: 'Australia', timezone: 'Australia/Sydney' },
  { id: 'melbourne', name: 'Melbourne', region: 'Australia', timezone: 'Australia/Melbourne' },
  { id: 'brisbane', name: 'Brisbane', region: 'Australia', timezone: 'Australia/Brisbane' },
  { id: 'perth', name: 'Perth', region: 'Australia', timezone: 'Australia/Perth' },
  { id: 'adelaide', name: 'Adelaide', region: 'Australia', timezone: 'Australia/Adelaide' },
  { id: 'canberra', name: 'Canberra', region: 'Australia', timezone: 'Australia/Sydney' },
  { id: 'hobart', name: 'Hobart', region: 'Australia', timezone: 'Australia/Hobart' },
  { id: 'darwin', name: 'Darwin', region: 'Australia', timezone: 'Australia/Darwin' },
  { id: 'auckland', name: 'Auckland', region: 'New Zealand', timezone: 'Pacific/Auckland' },
  { id: 'wellington', name: 'Wellington', region: 'New Zealand', timezone: 'Pacific/Auckland' },
  { id: 'christchurch', name: 'Christchurch', region: 'New Zealand', timezone: 'Pacific/Auckland' },
  { id: 'fiji', name: 'Fiji', region: 'Fiji', timezone: 'Pacific/Fiji' },

  // --- AFRICA ---
  { id: 'cairo', name: 'Cairo', region: 'Egypt', timezone: 'Africa/Cairo' },
  { id: 'lagos', name: 'Lagos', region: 'Nigeria', timezone: 'Africa/Lagos' },
  { id: 'nairobi', name: 'Nairobi', region: 'Kenya', timezone: 'Africa/Nairobi' },
  { id: 'capetown', name: 'Cape Town', region: 'South Africa', timezone: 'Africa/Johannesburg' },
  { id: 'johannesburg', name: 'Johannesburg', region: 'South Africa', timezone: 'Africa/Johannesburg' },
  { id: 'casablanca', name: 'Casablanca', region: 'Morocco', timezone: 'Africa/Casablanca' },
  { id: 'marrakech', name: 'Marrakech', region: 'Morocco', timezone: 'Africa/Casablanca' },
  { id: 'tunis', name: 'Tunis', region: 'Tunisia', timezone: 'Africa/Tunis' },
  { id: 'addisababa', name: 'Addis Ababa', region: 'Ethiopia', timezone: 'Africa/Addis_Ababa' },
  { id: 'accra', name: 'Accra', region: 'Ghana', timezone: 'Africa/Accra' },
];
