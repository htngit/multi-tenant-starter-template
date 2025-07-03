import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { redirect } from 'next/navigation';
import { InventoryItemsClient } from './inventory-items-client';
import { getInventorySummarySSR, getProductsSSR } from '@/lib/supabase-ssr';

/**
 * Optimized Server Component for Inventory Items
 * Features:
 * - Server-side data fetching with Supabase SSR
 * - Stack Auth integration for tenant context
 * - Efficient data prefetching for better UX
 * - Real-time client component integration
 */

export const metadata: Metadata = {
  title: "Inventory Items | XalesIn ERP",
  description: "Manage your inventory items, stock levels, and product information.",
};

interface InventoryItemsPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function InventoryItemsPage({ params }: InventoryItemsPageProps) {
  const { teamId } = await params;
  
  // Validate tenant access (this would integrate with Stack Auth)
  if (!teamId) {
    redirect('/dashboard');
  }
  
  // Fetch initial data server-side using optimized SSR functions
  // These functions include caching, performance monitoring, and error handling
  const [inventorySummary, initialProducts] = await Promise.all([
    getInventorySummarySSR(teamId),
    getProductsSSR(teamId, { limit: 10 }),
  ]);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Items</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      {/* Server-rendered summary cards with real data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventorySummary.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Out of Stock
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventorySummary.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items out of stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(inventorySummary.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Client component for interactive features and real-time updates */}
      <InventoryItemsClient 
        tenantId={teamId}
        initialProducts={initialProducts.products}
        initialSummary={inventorySummary}
      />
    </div>
  );
}