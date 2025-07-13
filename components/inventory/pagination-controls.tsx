import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { generatePaginationInfo } from '@/lib/stock-utils';

interface PaginationControlsProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showItemsInfo?: boolean;
  className?: string;
}

export function PaginationControls({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  isLoading = false,
  showItemsInfo = true,
  className = '',
}: PaginationControlsProps) {
  const paginationInfo = generatePaginationInfo(currentPage, itemsPerPage, totalItems);
  const { startItem, endItem, totalPages, hasNext, hasPrev } = paginationInfo;

  if (totalItems === 0) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items Info */}
      {showItemsInfo && (
        <div className="text-sm text-muted-foreground">
          Menampilkan {startItem.toLocaleString()} hingga {endItem.toLocaleString()} dari {totalItems.toLocaleString()} item
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev || isLoading}
          onClick={() => handlePageChange(1)}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev || isLoading}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Sebelumnya</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-sm text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? 'default' : 'outline'}
                size="sm"
                disabled={isLoading}
                onClick={() => handlePageChange(pageNumber)}
                className={`min-w-[40px] ${
                  isCurrentPage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <span className="hidden sm:inline mr-1">Selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={() => handlePageChange(totalPages)}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Page Info */}
      <div className="sm:hidden text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </div>
    </div>
  );
}