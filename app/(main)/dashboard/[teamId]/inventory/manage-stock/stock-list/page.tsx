'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';

// Import custom components and hooks
import { useStockFilters } from '@/hooks/use-stock-filters';
import { StockSummaryCards } from '@/components/inventory/stock-summary-cards';
import { StockFilters } from '@/components/inventory/stock-filters';
import { StockTable } from '@/components/inventory/stock-table';
import { PaginationControls } from '@/components/inventory/pagination-controls';
import { StockAnalytics } from '@/components/inventory/stock-analytics';
import type { StockListItem, SortField } from '@/types/stock';



export default function StockListPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  
  // State for analytics view toggle
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Custom hook for filter management
  const {
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
  } = useStockFilters();
  
  // Add teamId to query parameters and fix sortBy field mapping
  const sortByMapping: Record<string, 'name' | 'sku' | 'stock' | 'value' | 'updated'> = {
    'name': 'name',
    'sku': 'sku', 
    'category': 'name',
    'warehouse': 'name',
    'availableStock': 'stock',
    'totalValue': 'value',
    'updatedAt': 'updated'
  };
  
  const stockQueryParams = { 
    ...queryParams, 
    teamId,
    sortBy: sortByMapping[queryParams.sortBy] || 'name' as const,
    stockStatus: queryParams.status
  };
  const stockSummaryParams = { ...summaryQueryParams, teamId };
  
  // API calls
  const { 
    data: stockData, 
    isLoading: isLoadingStock, 
    error: stockError 
  } = api.inventory.getStockList.useQuery(stockQueryParams);
  
  const { 
    data: summaryData, 
    isLoading: isLoadingSummary 
  } = api.inventory.getStockListSummary.useQuery(stockSummaryParams);
  
  const { 
    data: warehouses, 
    isLoading: isLoadingWarehouses 
  } = api.tenant.getWarehouses.useQuery();
  
  const { 
    data: categories, 
    isLoading: isLoadingCategories 
  } = api.inventory.getCategories.useQuery();
  
  // Event handlers
  const handleSort = (field: string) => {
    updateSort(field as SortField);
    updatePage(1);
  };
  
  const handlePageChange = (page: number) => {
    updatePage(page);
  };
  
  // Generic update filter function for components
  const updateFilter = (key: string, value: any) => {
    switch (key) {
      case 'search':
        updateSearch(value);
        break;
      case 'warehouseId':
        updateWarehouse(value);
        break;
      case 'categoryId':
        updateCategory(value);
        break;
      case 'status':
        updateStatus(value);
        break;
      case 'page':
        updatePage(value);
        break;
      default:
        console.warn(`Unknown filter key: ${key}`);
    }
  };
  
  const handleReset = () => {
    resetFilters();
  };

  // Loading and error states
  const isLoading = isLoadingStock || isLoadingSummary;
  
  if (stockError) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Terjadi kesalahan saat memuat data stok: {stockError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Stok</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau inventori Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showAnalytics ? 'Sembunyikan Analitik' : 'Tampilkan Analitik'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <StockSummaryCards 
        summary={summaryData || {
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          inStockItems: 0
        }} 
        isLoading={isLoadingSummary} 
      />

      {/* Analytics Section */}
      {showAnalytics && summaryData && (
        <StockAnalytics 
          summary={summaryData} 
          isLoading={isLoadingSummary} 
        />
      )}

      {/* Filters */}
      <StockFilters
        searchTerm={filters.search}
        selectedWarehouse={filters.warehouseId}
        selectedCategory={filters.categoryId}
        stockStatus={filters.status}
        warehouses={warehouses || []}
        categories={categories || []}
        onSearchChange={updateSearch}
        onWarehouseChange={updateWarehouse}
        onCategoryChange={updateCategory}
        onStatusChange={updateStatus}
        onReset={handleReset}
        isLoading={isLoadingWarehouses || isLoadingCategories}
      />

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Stok</CardTitle>
          <CardDescription>
            {stockData?.pagination ? (
              `Menampilkan ${stockData.pagination.total.toLocaleString()} item`
            ) : (
              'Memuat data stok...'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockTable
            items={stockData?.items?.map(item => ({
              ...item,
              warehouseLocation: '',
              stockQuantity: item.availableStock,
              reservedQuantity: item.reservedStock,
              costPrice: item.unitPrice,
              status: item.status as 'in_stock' | 'low_stock' | 'out_of_stock'
            })) || []}
            isLoading={isLoadingStock}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={handleSort}
          />
          
          {/* Pagination */}
          {stockData?.pagination && (
            <div className="mt-4">
              <PaginationControls
                currentPage={stockData.pagination.page}
                totalItems={stockData.pagination.total}
                itemsPerPage={stockData.pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}