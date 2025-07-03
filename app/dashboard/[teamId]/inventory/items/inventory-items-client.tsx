'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trpc } from '@/app/provider';
import { useRealtimeInventory } from '@/hooks/use-realtime-inventory';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null;
};

type InventorySummary = {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
};

interface InventoryItemsClientProps {
  tenantId: string;
  initialProducts: Product[];
  initialSummary: InventorySummary;
}

/**
 * Client Component for Inventory Items Management
 * Features:
 * - tRPC integration for data fetching and mutations
 * - Real-time subscriptions for live updates
 * - Advanced filtering and search
 * - Optimistic updates for better UX
 * - Error handling and retry logic
 */
export function InventoryItemsClient({ 
  tenantId, 
  initialProducts, 
  initialSummary 
}: InventoryItemsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // tRPC queries with optimistic updates
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = trpc.inventory.getProducts.useQuery(
    {
      search: searchTerm,
      isActive: filterStatus === 'active',
      page,
      limit: pageSize,
    },
    {
      initialData: {
        products: initialProducts,
        total: initialProducts.length,
        hasMore: initialProducts.length >= pageSize,
      },
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  );

  // Real-time subscriptions for live inventory updates
  const { 
    realtimeProducts, 
    realtimeSummary, 
    connectionStatus 
  } = useRealtimeInventory({
    tenantId,
    initialProducts,
    initialSummary,
  });

  // Mutations for inventory operations
  const updateProductMutation = trpc.inventory.updateProduct.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      console.error('Failed to update product:', error);
      // Show toast notification
    },
  });

  const deleteProductMutation = trpc.inventory.deleteProduct.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      console.error('Failed to delete product:', error);
      // Show toast notification
    },
  });

  // Use real-time data if available, fallback to tRPC data
  const products = realtimeProducts.length > 0 ? realtimeProducts : productsData?.products || [];
  const summary = realtimeSummary || initialSummary;

  // Stock status helper
  const getStockStatus = (product: Product) => {
    if (product.stock_quantity as number <= 0) return 'out_of_stock';
    if ((product.stock_quantity as number) <= (product.min_stock_level as number)) return 'low_stock';
    return 'in_stock';
  };

  // Stock status badge component
  const StockStatusBadge = ({ product }: { product: Product }) => {
    const status = getStockStatus(product);
    
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Out of Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            In Stock
          </Badge>
        );
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Inventory Items
              {connectionStatus === 'connected' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage your product inventory, track stock levels, and monitor item performance.
            </CardDescription>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {filterStatus !== 'all' && (
                  <Badge variant="secondary" className="ml-1">
                    {filterStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('low_stock')}>
                Low Stock Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('out_of_stock')}>
                Out of Stock Items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading && products.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading inventory items...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No inventory items found</p>
              <p className="text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first inventory item'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Products Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        {product.categories?.name && (
                          <Badge variant="outline">
                            {product.categories.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{product.stock_quantity}</p>
                          <p className="text-muted-foreground">
                            Min: {product.min_stock_level}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge product={product} />
                      </TableCell>
                      <TableCell>
                        ${product.unit_price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${((product.unit_price || 0) * product.stock_quantity).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  deleteProductMutation.mutate({
                                    tenantId,
                                    productId: product.id,
                                  });
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {productsData?.hasMore && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-destructive font-medium">Failed to load inventory items</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}