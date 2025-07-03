'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { Database } from '@/lib/database.types';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null;
};

type StockMovement = Database['public']['Tables']['stock_movements']['Row'];

type InventorySummary = {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
};

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseRealtimeInventoryProps {
  tenantId: string;
  initialProducts: Product[];
  initialSummary: InventorySummary;
}

interface UseRealtimeInventoryReturn {
  realtimeProducts: Product[];
  realtimeSummary: InventorySummary;
  connectionStatus: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}

/**
 * Custom hook for real-time inventory management
 * Features:
 * - Real-time product updates via Supabase subscriptions
 * - Stock movement tracking
 * - Automatic summary recalculation
 * - Connection status monitoring
 * - Error handling and reconnection logic
 * - Optimistic updates for better UX
 */
export function useRealtimeInventory({
  tenantId,
  initialProducts,
  initialSummary,
}: UseRealtimeInventoryProps): UseRealtimeInventoryReturn {
  const { supabase } = useSupabase();
  
  // State management
  const [realtimeProducts, setRealtimeProducts] = useState<Product[]>(initialProducts);
  const [realtimeSummary, setRealtimeSummary] = useState<InventorySummary>(initialSummary);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // Calculate inventory summary from products
  const calculateSummary = useCallback((products: Product[]): InventorySummary => {
    return products.reduce(
      (summary, product) => {
        const isActive = product.is_active;
        const stockQuantity = product.stock_quantity || 0;
        const unitPrice = product.unit_price || 0;
        const minStockLevel = product.min_stock_level || 0;
        
        if (isActive) {
          summary.totalItems += 1;
          summary.totalValue += stockQuantity * unitPrice;
          
          if (stockQuantity <= 0) {
            summary.outOfStockItems += 1;
          } else if (stockQuantity <= minStockLevel) {
            summary.lowStockItems += 1;
          }
        }
        
        return summary;
      },
      {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      }
    );
  }, []);

  // Handle product changes (INSERT, UPDATE, DELETE)
  const handleProductChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Product>) => {
      setLastUpdate(new Date());
      setError(null);
      
      setRealtimeProducts((currentProducts) => {
        let updatedProducts = [...currentProducts];
        
        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new && payload.new.tenant_id === tenantId) {
              updatedProducts.push(payload.new as Product);
            }
            break;
            
          case 'UPDATE':
            if (payload.new && payload.new.tenant_id === tenantId) {
              const index = updatedProducts.findIndex(p => p.id === payload.new.id);
              if (index !== -1) {
                updatedProducts[index] = payload.new as Product;
              }
            }
            break;
            
          case 'DELETE':
            if (payload.old) {
              updatedProducts = updatedProducts.filter(p => p.id !== payload.old.id);
            }
            break;
        }
        
        // Recalculate summary
        const newSummary = calculateSummary(updatedProducts);
        setRealtimeSummary(newSummary);
        
        return updatedProducts;
      });
    },
    [tenantId, calculateSummary]
  );

  // Handle stock movement changes
  const handleStockMovementChange = useCallback(
    (payload: RealtimePostgresChangesPayload<StockMovement>) => {
      if (payload.eventType === 'INSERT' && payload.new && payload.new.tenant_id === tenantId) {
        const stockMovement = payload.new;
        
        // Update the corresponding product's stock quantity
        setRealtimeProducts((currentProducts) => {
          const updatedProducts = currentProducts.map((product) => {
            if (product.id === stockMovement.product_id) {
              const newStockQuantity = Math.max(0, 
                (product.stock_quantity || 0) + (stockMovement.quantity_change || 0)
              );
              
              return {
                ...product,
                stock_quantity: newStockQuantity,
              };
            }
            return product;
          });
          
          // Recalculate summary
          const newSummary = calculateSummary(updatedProducts);
          setRealtimeSummary(newSummary);
          
          return updatedProducts;
        });
        
        setLastUpdate(new Date());
        setError(null);
      }
    },
    [tenantId, calculateSummary]
  );

  // Setup real-time subscriptions
  useEffect(() => {
    if (!supabase || !tenantId) return;

    setConnectionStatus('connecting');
    
    // Create channels for different table subscriptions
    const productsChannel = supabase
      .channel(`products_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `tenant_id=eq.${tenantId}`,
        },
        handleProductChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
          setError('Failed to connect to products channel');
        }
      });

    const stockMovementsChannel = supabase
      .channel(`stock_movements_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_movements',
          filter: `tenant_id=eq.${tenantId}`,
        },
        handleStockMovementChange
      )
      .subscribe();

    // Store channels for cleanup
    setChannels([productsChannel, stockMovementsChannel]);

    // Cleanup function
    return () => {
      productsChannel.unsubscribe();
      stockMovementsChannel.unsubscribe();
      setChannels([]);
      setConnectionStatus('disconnected');
    };
  }, [supabase, tenantId, handleProductChange, handleStockMovementChange]);

  // Monitor connection health
  useEffect(() => {
    if (!supabase) return;

    const checkConnection = () => {
      const status = supabase.realtime.isConnected();
      if (!status && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
        setError('Connection lost');
      }
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [supabase, connectionStatus]);

  // Auto-reconnect logic
  useEffect(() => {
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      const reconnectTimer = setTimeout(() => {
        if (channels.length > 0) {
          // Attempt to resubscribe
          channels.forEach(channel => {
            channel.subscribe();
          });
        }
      }, 3000); // Retry after 3 seconds
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [connectionStatus, channels]);

  return {
    realtimeProducts,
    realtimeSummary,
    connectionStatus,
    lastUpdate,
    error,
  };
}

/**
 * Hook for subscribing to specific product updates
 * Useful for product detail pages
 */
export function useRealtimeProduct(productId: string, tenantId: string) {
  const { supabase } = useSupabase();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !productId || !tenantId) return;

    // Fetch initial product data
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('id', productId)
          .eq('tenant_id', tenantId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

    // Subscribe to product changes
    const channel = supabase
      .channel(`product_${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProduct(payload.new as Product);
          } else if (payload.eventType === 'DELETE') {
            setProduct(null);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, productId, tenantId]);

  return { product, isLoading, error };
}

/**
 * Hook for real-time stock alerts
 * Monitors low stock and out of stock conditions
 */
export function useStockAlerts(tenantId: string) {
  const { realtimeProducts } = useRealtimeInventory({
    tenantId,
    initialProducts: [],
    initialSummary: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    },
  });

  const [alerts, setAlerts] = useState<{
    lowStock: Product[];
    outOfStock: Product[];
  }>({ lowStock: [], outOfStock: [] });

  useEffect(() => {
    const lowStock = realtimeProducts.filter(
      (product) => 
        product.is_active && 
        product.stock_quantity > 0 && 
        product.stock_quantity <= product.min_stock_level
    );

    const outOfStock = realtimeProducts.filter(
      (product) => 
        product.is_active && 
        product.stock_quantity <= 0
    );

    setAlerts({ lowStock, outOfStock });
  }, [realtimeProducts]);

  return alerts;
}