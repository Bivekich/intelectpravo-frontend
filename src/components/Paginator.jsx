import React from "react";

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        className="mx-1 px-3 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {"<<"}
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={`mx-1 px-3 py-1 border rounded ${
            currentPage === index + 1
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-500"
          } hover:bg-blue-100`}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        className="mx-1 px-3 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Paginator;
