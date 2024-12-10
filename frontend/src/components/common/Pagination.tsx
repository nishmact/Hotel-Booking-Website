import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  isTable: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, handlePageChange, isTable }) => {
  return (
    <>
      {!isTable ? (
        <div className="flex justify-end items-end gap-4 m-10">
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-gray-900 uppercase transition-all rounded-lg bg-pink-500 hover:bg-pink-400 disabled:pointer-events-none disabled:opacity-50"
              type="button"
              disabled={currentPage <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
              </svg>
              Previous
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg ${page === currentPage ? 'bg-pink-400 text-white' : 'bg-pink-100 text-gray-900'} text-center font-sans text-xs font-medium uppercase transition-all hover:bg-pink-300 focus:opacity-[0.85]`}
              type="button"
            >
              {page}
            </button>
          ))}
          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-gray-900 uppercase transition-all rounded-lg bg-pink-500 hover:bg-pink-400"
              type="button"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end border-t border-blue-gray-50 p-4 gap-1">
          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="bg-pink-500 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-pink-400"
              type="button"
              disabled={currentPage <= 1}
            >
              Previous
            </button>
          )}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-8 w-8 flex items-center justify-center rounded-md ${currentPage === page ? 'bg-pink-400 text-white' : 'bg-pink-100 text-gray-900'} transition-colors duration-200 hover:bg-pink-300`}
                type="button"
              >
                {page}
              </button>
            ))}
          </div>
          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="bg-pink-500 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-pink-400"
              type="button"
            >
              Next
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Pagination;
