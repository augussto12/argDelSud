import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };


  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-card">
      {/* Left: info + page size */}
      <div className="flex items-center gap-3 text-sm text-muted w-full sm:w-auto">
        <span className="whitespace-nowrap">
          {totalItems > 0
            ? <><span className="font-medium text-body">{from}–{to}</span> de <span className="font-medium text-body">{totalItems}</span></>
            : 'Sin registros'}
        </span>
        <span className="hidden sm:inline text-secondary-300">|</span>
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <span className="whitespace-nowrap text-xs">Mostrar</span>
          <select
            value={pageSize}
            onChange={e => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="py-1 pl-2 pr-6 rounded-lg border border-card bg-card text-body text-xs font-medium appearance-none cursor-pointer"
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4 text-muted" />
          </button>
          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-muted" />
          </button>

          {/* Page numbers (hidden on very small screens) */}
          <div className="hidden md:flex items-center gap-0.5">
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-muted select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    p === currentPage
                      ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/20'
                      : 'text-muted hover:bg-surface hover:text-body'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Mobile: simple page indicator */}
          <span className="md:hidden text-xs font-medium text-body px-2 whitespace-nowrap">
            {currentPage} / {totalPages}
          </span>

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4 text-muted" />
          </button>
        </div>
      )}
    </div>
  );
}
