/**
 * Utility functions for stock management
 */

/**
 * Format currency amount to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

/**
 * Format currency amount to USD
 */
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to localized string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time to localized string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('id-ID');
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get stock status color class
 */
export const getStockStatusColor = (status: 'in_stock' | 'low_stock' | 'out_of_stock'): string => {
  switch (status) {
    case 'out_of_stock':
      return 'text-red-600 bg-red-100';
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-100';
    case 'in_stock':
    default:
      return 'text-green-600 bg-green-100';
  }
};

/**
 * Get stock status label
 */
export const getStockStatusLabel = (status: 'in_stock' | 'low_stock' | 'out_of_stock'): string => {
  switch (status) {
    case 'out_of_stock':
      return 'Stok Habis';
    case 'low_stock':
      return 'Stok Menipis';
    case 'in_stock':
    default:
      return 'Tersedia';
  }
};

/**
 * Constants for stock management
 */
export const STOCK_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

/**
 * Validate stock level against min/max thresholds
 */
export const getStockStatus = (
  currentStock: number,
  minLevel: number,
  maxLevel?: number
): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= minLevel) return 'low_stock';
  return 'in_stock';
};

/**
 * Generate pagination info
 */
export const generatePaginationInfo = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  return {
    startItem,
    endItem,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};