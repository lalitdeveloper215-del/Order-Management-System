import { useMemo } from "react";

export const DOTS = "...";

export const usePagination = (totalItems: number, limit: number, currentPage: number, onPageChange: (page: number) => void) => {
  const totalPages = Math.ceil(totalItems / limit);

  const paginationRange = useMemo(() => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5; // siblingCount + first + last + current + 2*dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages, currentPage]);

  const goToNextPage = () => {
      if (currentPage < totalPages) {
          onPageChange(currentPage + 1);
      }
  };

  const goToPrevPage = () => {
      if (currentPage > 1) {
          onPageChange(currentPage - 1);
      }
  };

  return { totalPages, paginationRange, goToNextPage, goToPrevPage };
};
