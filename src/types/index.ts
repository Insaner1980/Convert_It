
export type NavigationTab = 'converter' | 'sizes' | 'kitchen' | 'currency' | 'tools';
export type KitchenSubTab = 'ingredients' | 'oven' | 'special';

export interface ConverterOption {
  id: string;
  label: string;
  factor: number; // Base unit multiplier
  offset?: number; // For temperature
}

export interface SizeChartItem {
  region: string;
  size: string;
}

// Flexible interface for various clothing grids
export interface SizeRow {
  label: string; // The primary size (e.g. "M" or "38")
  [key: string]: string; // Allows dynamic columns like 'eu', 'us', 'uk', 'cm'
}

export interface KitchenIngredient {
  id: string;
  name: string;
  category: string;
  density: number; // grams per 1 US Cup (approx 236.59ml)
}

export interface KitchenUnit {
  id: string;
  label: string;
  type: 'weight' | 'volume' | 'discrete';
  factor: number; // Relative to Grams (weight) or Cups (volume)
}

export interface OvenMark {
  gas: string | number;
  c: number;
  f: number;
}

export interface CurrencyRate {
  code: string;
  rate: number; // Relative to USD
  symbol: string;
  name: string;
}

export interface WorldCity {
  id: string;
  name: string;
  region: string;
  timezone: string; // IANA timezone string
}

export type Gender = 'women' | 'men' | 'kids' | 'health';
export type SizeCategory = 'shoes' | 'tops' | 'bottoms' | 'dresses' | 'bras' | 'suits' | 'baby' | 'junior' | 'bmi';
