import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package } from 'lucide-react';
import type { StockListItem, SortField, SortOrder } from '@/types/stock';
import { StockStatusBadge } from './stock-status-badge';
import { formatUSD, formatDate } from '@/lib/stock-utils';

interface StockTableProps {
  items: StockListItem[];
  isLoading?: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  emptyStateMessage?: {
    title: string;
    description: string;
  };
}

interface SortableHeaderProps {
  field: SortField;
  currentSort: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

function SortableHeader({ 
  field, 
  currentSort, 
  currentOrder, 
  onSort, 
  children, 
  className = '' 
}: SortableHeaderProps) {
  const isActive = currentSort === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {isActive && (
          <span className="text-blue-600 font-bold">
            {currentOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><div className="h-5 w-32 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-20 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-28 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-16 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-20 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-20 bg-gray-200 animate-pulse rounded" /></TableCell>
          <TableCell><div className="h-5 w-24 bg-gray-200 animate-pulse rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-muted-foreground max-w-md">{description}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function StockTable({
  items,
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
  emptyStateMessage = {
    title: 'Tidak ada item stok ditemukan',
    description: 'Mulai dengan menambahkan produk ke inventori Anda atau sesuaikan filter untuk melihat lebih banyak hasil.',
  },
}: StockTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              field="name"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Nama Produk
            </SortableHeader>
            <SortableHeader
              field="sku"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              SKU
            </SortableHeader>
            <SortableHeader
              field="category"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Kategori
            </SortableHeader>
            <SortableHeader
              field="warehouse"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Gudang
            </SortableHeader>
            <SortableHeader
              field="availableStock"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Stok Tersedia
            </SortableHeader>
            <SortableHeader
              field="totalValue"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Total Nilai
            </SortableHeader>
            <TableHead>Status</TableHead>
            <SortableHeader
              field="updatedAt"
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              Terakhir Diperbarui
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState 
              title={emptyStateMessage.title}
              description={emptyStateMessage.description}
            />
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="font-medium">{item.productName}</div>
                    {item.warehouseLocation && (
                      <div className="text-xs text-muted-foreground">
                        {item.warehouseLocation}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.categoryName || 'Tidak Dikategorikan'}
                  </span>
                </TableCell>
                <TableCell>{item.warehouseName}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {item.availableStock.toLocaleString()}
                      {item.maxStockLevel && (
                        <span className="text-muted-foreground"> / {item.maxStockLevel.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Min: {item.minStockLevel?.toLocaleString() || 'N/A'}
                      {item.reservedQuantity > 0 && (
                        <span className="ml-2 text-orange-600">
                          Reserved: {item.reservedQuantity.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatUSD(item.totalValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatUSD(item.unitPrice)} per unit
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StockStatusBadge status={item.status} size="sm" />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}