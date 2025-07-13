import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RotateCcw } from 'lucide-react';
import type { Warehouse, Category, StockStatusFilter } from '@/types/stock';

interface StockFiltersProps {
  searchTerm: string;
  selectedWarehouse: string;
  selectedCategory: string;
  stockStatus: StockStatusFilter;
  warehouses?: Warehouse[];
  categories?: Category[];
  onSearchChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: StockStatusFilter) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function StockFilters({
  searchTerm,
  selectedWarehouse,
  selectedCategory,
  stockStatus,
  warehouses = [],
  categories = [],
  onSearchChange,
  onWarehouseChange,
  onCategoryChange,
  onStatusChange,
  onReset,
  isLoading = false,
}: StockFiltersProps) {
  const hasActiveFilters = 
    searchTerm || 
    selectedWarehouse !== 'all' || 
    selectedCategory !== 'all' || 
    stockStatus !== 'all';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari produk berdasarkan nama, SKU, atau kategori..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Warehouse Filter */}
          <Select 
            value={selectedWarehouse} 
            onValueChange={onWarehouseChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Pilih gudang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gudang</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select 
            value={selectedCategory} 
            onValueChange={onCategoryChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={stockStatus} 
            onValueChange={onStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status stok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="in_stock">Tersedia</SelectItem>
              <SelectItem value="low_stock">Stok Menipis</SelectItem>
              <SelectItem value="out_of_stock">Stok Habis</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="default"
              onClick={onReset}
              disabled={isLoading}
              className="w-full lg:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter aktif:</span>
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Pencarian: &quot;{searchTerm}&quot;
              </span>
            )}
            {selectedWarehouse !== 'all' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                Gudang: {warehouses.find(w => w.id === selectedWarehouse)?.name || selectedWarehouse}
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                Kategori: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
              </span>
            )}
            {stockStatus !== 'all' && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                Status: {stockStatus === 'in_stock' ? 'Tersedia' : stockStatus === 'low_stock' ? 'Stok Menipis' : 'Stok Habis'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}