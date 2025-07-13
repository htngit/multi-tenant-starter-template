import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { StockStatus } from '@/types/stock';
import { getStockStatusLabel } from '@/lib/stock-utils';

interface StockStatusBadgeProps {
  status: StockStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StockStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className = '' 
}: StockStatusBadgeProps) {
  const getStatusConfig = (status: StockStatus) => {
    switch (status) {
      case 'out_of_stock':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: getStockStatusLabel(status),
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
        };
      case 'low_stock':
        return {
          variant: 'secondary' as const,
          icon: AlertTriangle,
          label: getStockStatusLabel(status),
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        };
      case 'in_stock':
      default:
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: getStockStatusLabel(status),
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
        };
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      case 'md':
      default:
        return 'text-sm px-2.5 py-1.5';
    }
  };

  const getIconSize = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-4 w-4';
      case 'md':
      default:
        return 'h-3 w-3';
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={iconSize} />}
      {config.label}
    </Badge>
  );
}