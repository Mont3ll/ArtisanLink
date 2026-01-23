/**
 * Quote Line Item Categories and Deposit Configuration
 * 
 * This file defines the predefined categories for quote line items,
 * common items within each category, and deposit configuration rules.
 */

// Predefined line item categories with common items
export const QUOTE_LINE_ITEM_CATEGORIES = {
  LABOR: {
    key: 'LABOR',
    name: 'Labor',
    description: 'Work performed by artisan and helpers',
    icon: 'Hammer',
    commonItems: [
      { name: 'Skilled Labor', unit: 'hours', defaultPrice: 500 },
      { name: 'Helper/Assistant', unit: 'hours', defaultPrice: 300 },
      { name: 'Supervision', unit: 'hours', defaultPrice: 600 },
      { name: 'Overtime Work', unit: 'hours', defaultPrice: 750 },
    ],
  },
  MATERIALS: {
    key: 'MATERIALS',
    name: 'Materials',
    description: 'Physical materials used in the job',
    icon: 'Package',
    commonItems: [], // Job-specific, entered by artisan
  },
  EQUIPMENT: {
    key: 'EQUIPMENT',
    name: 'Equipment',
    description: 'Tools and equipment rental',
    icon: 'Wrench',
    commonItems: [
      { name: 'Power Tools Rental', unit: 'days', defaultPrice: 500 },
      { name: 'Scaffolding', unit: 'days', defaultPrice: 1000 },
      { name: 'Safety Equipment', unit: 'sets', defaultPrice: 300 },
      { name: 'Specialized Machinery', unit: 'days', defaultPrice: 2000 },
    ],
  },
  TRANSPORT: {
    key: 'TRANSPORT',
    name: 'Transport',
    description: 'Delivery and transportation costs',
    icon: 'Truck',
    commonItems: [
      { name: 'Material Delivery', unit: 'trips', defaultPrice: 500 },
      { name: 'Equipment Transport', unit: 'trips', defaultPrice: 800 },
      { name: 'Site Visits', unit: 'trips', defaultPrice: 300 },
      { name: 'Waste Removal', unit: 'trips', defaultPrice: 1000 },
    ],
  },
  CONSUMABLES: {
    key: 'CONSUMABLES',
    name: 'Consumables',
    description: 'Items used up during work',
    icon: 'Droplets',
    commonItems: [
      { name: 'Safety Gear', unit: 'sets', defaultPrice: 200 },
      { name: 'Adhesives/Sealants', unit: 'units', defaultPrice: 150 },
      { name: 'Fasteners', unit: 'boxes', defaultPrice: 100 },
      { name: 'Cleaning Supplies', unit: 'units', defaultPrice: 200 },
    ],
  },
  OPERATION_COST: {
    key: 'OPERATION_COST',
    name: 'Operation Costs',
    description: 'Administrative and operational expenses',
    icon: 'ClipboardList',
    commonItems: [
      { name: 'Permits/Licenses', unit: 'units', defaultPrice: 1000 },
      { name: 'Insurance', unit: 'jobs', defaultPrice: 500 },
      { name: 'Site Preparation', unit: 'jobs', defaultPrice: 1500 },
      { name: 'Inspection Fees', unit: 'units', defaultPrice: 500 },
    ],
  },
  OTHER: {
    key: 'OTHER',
    name: 'Other',
    description: 'Miscellaneous costs',
    icon: 'MoreHorizontal',
    commonItems: [],
  },
} as const;

// System-generated adjustment categories (read-only, not selectable by artisan)
export const ADJUSTMENT_CATEGORIES = {
  DISCOUNT: {
    key: 'DISCOUNT',
    name: 'Discount',
    description: 'Price reduction applied',
    isSystemGenerated: true,
  },
  MISCELLANEOUS: {
    key: 'MISCELLANEOUS',
    name: 'Miscellaneous',
    description: 'Additional costs',
    isSystemGenerated: true,
  },
} as const;

// Deposit configuration and thresholds
export const DEPOSIT_CONFIG = {
  // Percentage ranges
  MIN_PERCENT: 10,
  STANDARD_MAX_PERCENT: 50,
  MATERIAL_HEAVY_MAX_PERCENT: 70,
  VERY_MATERIAL_HEAVY_MAX_PERCENT: 80,

  // Material thresholds for higher deposit allowance
  MATERIAL_HEAVY_THRESHOLD_PERCENT: 50,      // Materials >= 50% → max deposit 70%
  VERY_MATERIAL_HEAVY_THRESHOLD_PERCENT: 65, // Materials >= 65% → max deposit 80%
  MIN_MATERIAL_VALUE_FOR_HIGHER_DEPOSIT: 5000, // Minimum KES value of materials

  // Adjustment threshold for Discount/Miscellaneous line items
  ADJUSTMENT_THRESHOLD: 100, // KES - only add adjustment if difference >= this
} as const;

// Type exports
export type QuoteLineItemCategory = keyof typeof QUOTE_LINE_ITEM_CATEGORIES;
export type AdjustmentCategory = keyof typeof ADJUSTMENT_CATEGORIES;

// Helper type for common items
export interface CommonItem {
  name: string;
  unit: string;
  defaultPrice?: number;
}

// Helper function to get all selectable categories (excludes system-generated)
export function getSelectableCategories(): QuoteLineItemCategory[] {
  return Object.keys(QUOTE_LINE_ITEM_CATEGORIES) as QuoteLineItemCategory[];
}

// Helper function to get category display info
export function getCategoryInfo(category: string) {
  if (category in QUOTE_LINE_ITEM_CATEGORIES) {
    return QUOTE_LINE_ITEM_CATEGORIES[category as QuoteLineItemCategory];
  }
  if (category in ADJUSTMENT_CATEGORIES) {
    return ADJUSTMENT_CATEGORIES[category as AdjustmentCategory];
  }
  return null;
}

// Helper function to calculate max allowed deposit based on material cost
export function calculateMaxDeposit(materialsCost: number, totalAmount: number): number {
  if (totalAmount <= 0) return DEPOSIT_CONFIG.STANDARD_MAX_PERCENT;

  const materialPercentage = (materialsCost / totalAmount) * 100;

  // Check if materials meet minimum value threshold
  if (materialsCost < DEPOSIT_CONFIG.MIN_MATERIAL_VALUE_FOR_HIGHER_DEPOSIT) {
    return DEPOSIT_CONFIG.STANDARD_MAX_PERCENT;
  }

  // Determine max deposit based on material percentage
  if (materialPercentage >= DEPOSIT_CONFIG.VERY_MATERIAL_HEAVY_THRESHOLD_PERCENT) {
    return DEPOSIT_CONFIG.VERY_MATERIAL_HEAVY_MAX_PERCENT;
  }

  if (materialPercentage >= DEPOSIT_CONFIG.MATERIAL_HEAVY_THRESHOLD_PERCENT) {
    return DEPOSIT_CONFIG.MATERIAL_HEAVY_MAX_PERCENT;
  }

  return DEPOSIT_CONFIG.STANDARD_MAX_PERCENT;
}

// Helper function to get deposit tier description
export function getDepositTierDescription(maxDeposit: number): string {
  if (maxDeposit >= DEPOSIT_CONFIG.VERY_MATERIAL_HEAVY_MAX_PERCENT) {
    return 'Very material-heavy job (materials ≥65%)';
  }
  if (maxDeposit >= DEPOSIT_CONFIG.MATERIAL_HEAVY_MAX_PERCENT) {
    return 'Material-heavy job (materials ≥50%)';
  }
  return 'Standard job';
}

// Helper to check if a category is system-generated
export function isSystemGeneratedCategory(category: string): boolean {
  return category in ADJUSTMENT_CATEGORIES;
}
