// Currency Data
// Static info (symbols, names). Rates fetched from ExchangeRate-API.

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
