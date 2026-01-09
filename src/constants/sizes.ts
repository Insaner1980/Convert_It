// Size Charts Data
import { SizeRow } from '../types';

// --- SHOES ---

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

// --- CLOTHING - WOMEN ---

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

// --- CLOTHING - MEN ---

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

// --- CLOTHING - KIDS ---

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

// --- BRA DATA ---

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
