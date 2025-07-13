export interface StockListItem {
  id: string;
  productId: string;
  warehouseId: string;
  productName: string;
  sku: string;
  categoryName: string;
  warehouseName: string;
  warehouseLocation: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  costPrice: number;
  totalValue: number;
  status: StockStatus;
  updatedAt: string;
}

export interface StockListSummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockItems: number;
}

export interface StockListResponse {
  items: StockListItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type SortField = 'name' | 'sku' | 'category' | 'warehouse' | 'availableStock' | 'totalValue' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type StockStatusFilter = 'all' | StockStatus;

export interface StockFilters {
  search: string;
  warehouseId: string;
  categoryId: string;
  status: StockStatusFilter;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface StockQueryParams {
  search?: string;
  warehouseId?: string;
  categoryId?: string;
  status?: StockStatus;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface StockSummaryQueryParams {
  warehouseId?: string;
}