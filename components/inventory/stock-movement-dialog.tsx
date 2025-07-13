'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Form validation schema
const stockMovementFormSchema = z.object({
  type: z.enum(['in', 'out', 'adjustment'], {
    required_error: 'Please select a movement type',
  }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  unitCost: z.coerce.number().min(0, 'Unit cost must be positive').optional(),
  supplierName: z.string().optional(),
  referenceNumber: z.string().optional(),
});

type StockMovementFormValues = z.infer<typeof stockMovementFormSchema>;

// Use the same Product type as inventory-items-client.tsx
type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null;
  currentStock?: number;
  stock_movements?: Array<{ quantity: number; movement_type: string }>;
};

// Import Database type
import type { Database } from '@/lib/database.types';

interface StockMovementDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StockMovementDialog({
  product,
  open,
  onOpenChangeAction,
  onSuccess,
}: StockMovementDialogProps) {
  // Form setup
  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: {
      type: 'in',
      quantity: 1,
      reason: '',
      notes: '',
      unitCost: undefined,
      supplierName: '',
      referenceNumber: '',
    },
  });

  const watchedType = form.watch('type');
  const watchedQuantity = form.watch('quantity');

  // Create stock movement mutation
  const createStockMovementMutation = api.inventory.createStockMovement.useMutation({
    onSuccess: () => {
      toast.success('Stock movement recorded successfully!');
      form.reset();
      onOpenChangeAction(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to record stock movement', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: StockMovementFormValues) => {
    if (!product) return;

    createStockMovementMutation.mutate({
      productId: product.id,
      ...values,
    });
  };

  // Calculate new stock quantity
  const calculateNewStock = () => {
    const currentStock = product?.currentStock || 0;
    if (!product || !watchedQuantity) return currentStock;
    
    switch (watchedType) {
      case 'in':
        return currentStock + watchedQuantity;
      case 'out':
        return Math.max(0, currentStock - watchedQuantity);
      case 'adjustment':
        return watchedQuantity;
      default:
        return currentStock;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonPlaceholder = (type: string) => {
    switch (type) {
      case 'in':
        return 'e.g., Purchase, Return, Production';
      case 'out':
        return 'e.g., Sale, Damage, Transfer';
      case 'adjustment':
        return 'e.g., Stock count, Correction';
      default:
        return 'Enter reason for stock movement';
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movement
          </DialogTitle>
          <DialogDescription>
            Record stock movement for <strong>{product.name}</strong> (SKU: {product.sku})
          </DialogDescription>
        </DialogHeader>

        {/* Current Stock Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Stock:</span>
            <Badge variant="outline">
              {product.currentStock || 0} {product.unit_of_measure || 'units'}
            </Badge>
          </div>
          {watchedQuantity > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Stock:</span>
              <Badge className={getMovementColor(watchedType)}>
                {calculateNewStock()} {product.unit_of_measure || 'units'}
              </Badge>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Movement Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movement Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select movement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Stock In
                        </div>
                      </SelectItem>
                      <SelectItem value="out">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          Stock Out
                        </div>
                      </SelectItem>
                      <SelectItem value="adjustment">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-blue-600" />
                          Adjustment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedType === 'adjustment' ? 'Set to this quantity' : `${watchedType === 'in' ? 'Add' : 'Remove'} this quantity`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost (for stock in) */}
              {watchedType === 'in' && (
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cost per unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getReasonPlaceholder(watchedType)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Supplier Name (for stock in) */}
            {watchedType === 'in' && (
              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter supplier name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., PO-001, INV-123"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Purchase order, invoice, or other reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChangeAction(false)}
                disabled={createStockMovementMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStockMovementMutation.isPending}
                className="flex items-center gap-2"
              >
                {createStockMovementMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {getMovementIcon(watchedType)}
                Record Movement
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}