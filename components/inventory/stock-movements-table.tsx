'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  History,
  Package,
  Calendar,
  User,
  FileText,
  DollarSign,
  Building,
  Hash,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/lib/database.types';

// Use the same Product type as inventory-items-client.tsx
type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null;
  currentStock?: number;
  stock_movements?: Array<{ quantity: number; movement_type: string }>;
};

// Use the actual database type for stock movements
type StockMovement = Database['public']['Tables']['stock_movements']['Row'] & {
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

interface StockMovementsTableProps {
  product: Product | null;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function StockMovementsTable({
  product,
  open,
  onOpenChangeAction,
}: StockMovementsTableProps) {
  // Fetch stock movements for the product
  const { data: stockMovementsData, isLoading } = api.inventory.getStockMovements.useQuery(
    { productId: product?.id || '' },
    { enabled: !!product?.id && open }
  );

  // Extract movements array from the API response
  const movements = stockMovementsData?.movements || [];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'transfer':
        return <Package className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Stock In
          </Badge>
        );
      case 'out':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            Stock Out
          </Badge>
        );
      case 'adjustment':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <RotateCcw className="h-3 w-3 mr-1" />
            Adjustment
          </Badge>
        );
      case 'transfer':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Package className="h-3 w-3 mr-1" />
            Transfer
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatQuantity = (quantity: number, type: string) => {
    const sign = type === 'out' ? '-' : type === 'in' ? '+' : '';
    return `${sign}${quantity}`;
  };

  const getQuantityColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'text-green-600 font-semibold';
      case 'out':
        return 'text-red-600 font-semibold';
      case 'adjustment':
        return 'text-blue-600 font-semibold';
      case 'transfer':
        return 'text-purple-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Stock Movement History
          </DialogTitle>
          <DialogDescription>
            Complete history of stock movements for <strong>{product.name}</strong> (SKU: {product.sku})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : movements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <CardTitle className="text-lg text-gray-600 mb-2">
                  No Stock Movements
                </CardTitle>
                <CardDescription>
                  No stock movements have been recorded for this product yet.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Total Stock In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {movements
                        .filter((m) => m.movement_type === 'in')
                        .reduce((sum, m) => sum + Math.abs(m.quantity || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Total Stock Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {movements
                        .filter((m) => m.movement_type === 'out')
                        .reduce((sum, m) => sum + Math.abs(m.quantity || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                      Adjustments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {movements.filter((m) => m.movement_type === 'adjustment').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Movements Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Movement Details</CardTitle>
                  <CardDescription>
                    Chronological list of all stock movements
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                {format(new Date(movement.created_at || ''), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(movement.created_at || ''), 'HH:mm:ss')}
                              </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {getMovementBadge(movement.movement_type || '')}
                          </TableCell>
                          
                          <TableCell>
                            <span className={getQuantityColor(movement.movement_type || '')}>
                              {formatQuantity(movement.quantity || 0, movement.movement_type || '')}
                            </span>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{movement.reference_type || 'Manual Entry'}</span>
                            </div>
                            {movement.notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                {movement.notes}
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              {movement.reference_id && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Hash className="h-3 w-3 text-gray-400" />
                                  <span>{movement.reference_id}</span>
                                </div>
                              )}
                              {movement.warehouse_id && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Building className="h-3 w-3 text-gray-400" />
                                  <span>Warehouse: {movement.warehouse_id}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {movement.created_by_user ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-sm">
                                    {movement.created_by_user.first_name} {movement.created_by_user.last_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {movement.created_by_user.id}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">System</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a trigger button component for convenience
interface StockMovementsTableTriggerProps {
  product: Product;
  children?: React.ReactNode;
}

export function StockMovementsTableTrigger({
  product,
  children,
}: StockMovementsTableTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            View History
          </Button>
        )}
      </DialogTrigger>
      <StockMovementsTable
        product={product}
        open={open}
        onOpenChangeAction={setOpen}
      />
    </>
  );
}