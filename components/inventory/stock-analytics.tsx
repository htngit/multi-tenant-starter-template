import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StockListSummary } from '@/types/stock';
import { calculatePercentage, formatNumber } from '@/lib/stock-utils';

interface StockAnalyticsProps {
  summary: StockListSummary;
  isLoading?: boolean;
}

interface StockDistributionItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TopCategoriesItem {
  name: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

function StockDistributionCard({ summary, isLoading }: { summary: StockListSummary; isLoading: boolean }) {
  const distributionData: StockDistributionItem[] = [
    {
      status: 'Tersedia',
      count: summary.inStockItems,
      percentage: calculatePercentage(summary.inStockItems, summary.totalItems),
      color: 'bg-green-600',
      icon: TrendingUp,
    },
    {
      status: 'Stok Menipis',
      count: summary.lowStockItems,
      percentage: calculatePercentage(summary.lowStockItems, summary.totalItems),
      color: 'bg-yellow-600',
      icon: Minus,
    },
    {
      status: 'Stok Habis',
      count: summary.outOfStockItems,
      percentage: calculatePercentage(summary.outOfStockItems, summary.totalItems),
      color: 'bg-red-600',
      icon: TrendingDown,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribusi Level Stok
        </CardTitle>
        <CardDescription>Breakdown status inventori saat ini</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-2 w-full bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {distributionData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatNumber(item.count)}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                  <Progress 
                    value={item.percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopCategoriesCard({ isLoading }: { isLoading: boolean }) {
  // Mock data - in real app, this would come from props or API
  const topCategories: TopCategoriesItem[] = [
    { name: 'Elektronik', value: 1250, percentage: 35, trend: 'up' },
    { name: 'Pakaian', value: 890, percentage: 25, trend: 'stable' },
    { name: 'Makanan', value: 650, percentage: 18, trend: 'down' },
    { name: 'Buku', value: 420, percentage: 12, trend: 'up' },
    { name: 'Olahraga', value: 290, percentage: 10, trend: 'stable' },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'stable':
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Teratas</CardTitle>
        <CardDescription>Kategori dengan stok terbanyak</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full" style={{ opacity: 1 - (index * 0.15) }} />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{formatNumber(category.value)}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(category.trend)}
                    <span className={`text-xs ${getTrendColor(category.trend)}`}>
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StockValueCard({ summary, isLoading }: { summary: StockListSummary; isLoading: boolean }) {
  // Mock data for demonstration
  const valueMetrics = [
    {
      label: 'Total Nilai Inventori',
      value: summary.totalValue,
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      label: 'Nilai Rata-rata per Item',
      value: summary.totalItems > 0 ? summary.totalValue / summary.totalItems : 0,
      change: '+3.2%',
      trend: 'up' as const,
    },
    {
      label: 'Nilai Stok Menipis',
      value: summary.totalValue * 0.15, // Estimate
      change: '-5.8%',
      trend: 'down' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisis Nilai Stok</CardTitle>
        <CardDescription>Metrik nilai inventori</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {valueMetrics.map((metric, index) => (
              <div key={index} className="space-y-1">
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <div className="text-lg font-bold">
                  ${metric.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.change} dari bulan lalu
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StockAnalytics({ summary, isLoading = false }: StockAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StockDistributionCard summary={summary} isLoading={isLoading} />
      <TopCategoriesCard isLoading={isLoading} />
      <StockValueCard summary={summary} isLoading={isLoading} />
    </div>
  );
}