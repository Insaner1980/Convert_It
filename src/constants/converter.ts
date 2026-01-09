// Converter Units Data
import { ConverterOption } from '../types';

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
  { id: 'mb', label: 'Megabytes (MB)', factor: 1048576 },
  { id: 'gb', label: 'Gigabytes (GB)', factor: 1073741824 },
  { id: 'tb', label: 'Terabytes (TB)', factor: 1099511627776 },
  { id: 'pb', label: 'Petabytes (PB)', factor: 1125899906842624 },
  { id: 'bit', label: 'Bits (b)', factor: 0.125 },
];

export const SPEED_UNITS: ConverterOption[] = [
  { id: 'ms', label: 'Meters/second (m/s)', factor: 1 },
  { id: 'kmh', label: 'Kilometers/hour (km/h)', factor: 0.277778 },
  { id: 'mph', label: 'Miles/hour (mph)', factor: 0.44704 },
  { id: 'knot', label: 'Knots (kn)', factor: 0.514444 },
  { id: 'fts', label: 'Feet/second (ft/s)', factor: 0.3048 },
  { id: 'mach', label: 'Mach', factor: 343 },
];
