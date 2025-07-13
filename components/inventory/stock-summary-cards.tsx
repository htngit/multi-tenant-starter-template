import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp, XCircle } from 'lucide-react';
import type { StockListSummary } from '@/types/stock';
import { formatUSD, formatNumber } from '@/lib/stock-utils';

interface StockSummaryCardsProps {
  summary: StockListSummary;
  isLoading?: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  valueColor?: string;
  isLoading?: boolean;
}

function SummaryCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  iconColor = 'text-muted-foreground',
  valueColor = '',
  isLoading = false 
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            typeof value === 'number' ? formatNumber(value) : value
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function StockSummaryCards({ summary, isLoading = false }: StockSummaryCardsProps) {
  const summaryCards = [
    {
      title: 'Total Items',
      value: summary.totalItems,
      description: 'Across all warehouses',
      icon: Package,
      iconColor: 'text-muted-foreground',
    },
    {
      title: 'Low Stock Items',
      value: summary.lowStockItems,
      description: 'Items below minimum level',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
    },
    {
      title: 'Total Stock Value',
      value: formatUSD(summary.totalValue),
      description: 'Current inventory value',
      icon: TrendingUp,
      iconColor: 'text-green-600',
    },
    {
      title: 'Out of Stock',
      value: summary.outOfStockItems,
      description: 'Items requiring restock',
      icon: XCircle,
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          iconColor={card.iconColor}
          valueColor={card.valueColor}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}