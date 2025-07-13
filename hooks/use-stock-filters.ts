import { useState, useEffect, useCallback, useMemo } from 'react';
import type { StockFilters, SortField, SortOrder, StockStatusFilter } from '@/types/stock';
import { STOCK_CONSTANTS } from '@/lib/stock-utils';

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing stock filters
 */
export function useStockFilters() {
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    warehouseId: 'all',
    categoryId: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: STOCK_CONSTANTS.DEFAULT_PAGE_SIZE,
  });

  const debouncedSearch = useDebounce(filters.search, STOCK_CONSTANTS.DEBOUNCE_DELAY);

  // Reset page when filters change
  useEffect(() => {
    if (filters.page !== 1) {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearch, filters.warehouseId, filters.categoryId, filters.status, filters.sortBy, filters.sortOrder]);

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const updateWarehouse = useCallback((warehouseId: string) => {
    setFilters(prev => ({ ...prev, warehouseId }));
  }, []);

  const updateCategory = useCallback((categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId }));
  }, []);

  const updateStatus = useCallback((status: StockStatusFilter) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const updateSort = useCallback((sortBy: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      warehouseId: 'all',
      categoryId: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: STOCK_CONSTANTS.DEFAULT_PAGE_SIZE,
    });
  }, []);

  // Generate query parameters for API calls
  const queryParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    warehouseId: filters.warehouseId === 'all' ? undefined : filters.warehouseId,
    categoryId: filters.categoryId === 'all' ? undefined : filters.categoryId,
    status: filters.status === 'all' ? undefined : filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  }), [debouncedSearch, filters]);

  const summaryQueryParams = useMemo(() => ({
    warehouseId: filters.warehouseId === 'all' ? undefined : filters.warehouseId,
  }), [filters.warehouseId]);

  return {
    filters,
    debouncedSearch,
    queryParams,
    summaryQueryParams,
    updateSearch,
    updateWarehouse,
    updateCategory,
    updateStatus,
    updateSort,
    updatePage,
    resetFilters,
  };
}

/**
 * Custom hook for managing stock data with error handling
 */
export function useStockData(queryParams: any, summaryQueryParams: any) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    refreshKey,
    refresh,
  };
}