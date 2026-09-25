import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxPagesToShow = 7;
  let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let end = start + maxPagesToShow - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center space-x-3 mt-8 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
      <button
        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-green-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ← Anterior
      </button>

      {start > 1 && (
        <button 
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-green-500 hover:text-white transition-all duration-300 font-medium" 
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      )}

      {start > 2 && <span className="px-2 text-gray-400 font-medium">...</span>}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
            p === currentPage 
              ? 'bg-green-600 text-white shadow-lg scale-110' 
              : 'bg-gray-100 hover:bg-green-500 hover:text-white hover:scale-105'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages - 1 && <span className="px-2 text-gray-400 font-medium">...</span>}

      {end < totalPages && (
        <button 
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-green-500 hover:text-white transition-all duration-300 font-medium" 
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      )}

      <button
        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-green-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Próxima →
      </button>
    </div>
  );
};

export default Pagination;
