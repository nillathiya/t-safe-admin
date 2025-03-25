import React from 'react';
import ReactPaginate from 'react-paginate';
import './Pagination.css'; 

interface PaginationProps {
  pageCount: number;
  onPageChange: (e: any) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pageCount, onPageChange }) => {
  return (
    <ReactPaginate
      previousLabel={'← Prev'}
      nextLabel={'Next →'}
      breakLabel={'...'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={'pagination'}
      activeClassName={'active'}
    />
  );
};

export default Pagination;
