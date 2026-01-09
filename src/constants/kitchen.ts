// Kitchen Data
import { KitchenUnit, KitchenIngredient, OvenMark } from '../types';

// Base: Grams for Weight, Cups (US) for Volume
export const KITCHEN_UNITS: KitchenUnit[] = [
  // Weight
  { id: 'g', label: 'Grams (g)', type: 'weight', factor: 1 },
  { id: 'kg', label: 'Kilograms (kg)', type: 'weight', factor: 1000 },
  { id: 'oz', label: 'Ounces (oz)', type: 'weight', factor: 28.3495 },
  { id: 'lb', label: 'Pounds (lb)', type: 'weight', factor: 453.592 },

  // Volume (Base = 1 Cup US ~ 236.59ml)
  { id: 'cup', label: 'Cups (US)', type: 'volume', factor: 1 },
  { id: 'dl', label: 'Deciliters (dl)', type: 'volume', factor: 0.422675 },
  { id: 'ml', label: 'Milliliters (ml)', type: 'volume', factor: 0.00422675 },
  { id: 'l', label: 'Liters (l)', type: 'volume', factor: 4.22675 },
  { id: 'tbsp', label: 'Tablespoons', type: 'volume', factor: 0.0625 },
  { id: 'tsp', label: 'Teaspoons', type: 'volume', factor: 0.0208333 },
  { id: 'fl_oz', label: 'Fluid Ounces (US)', type: 'volume', factor: 0.125 },
  { id: 'pt_us', label: 'Pints (US)', type: 'volume', factor: 2 },
  { id: 'qt_us', label: 'Quarts (US)', type: 'volume', factor: 4 },
  { id: 'gal_us', label: 'Gallons (US)', type: 'volume', factor: 16 },
  { id: 'pt_uk', label: 'Pints (UK)', type: 'volume', factor: 2.4019 },

  // Discrete (Butter)
  { id: 'stick', label: 'Stick (Butter)', type: 'discrete', factor: 113.4 },
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
  { id: 'flour_sr_uk', name: 'Flour, Self-Raising (UK)', category: 'Flours', density: 140 },
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
