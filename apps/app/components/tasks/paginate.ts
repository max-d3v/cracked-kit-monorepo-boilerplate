export type PaginatedResult<T> = {
  /** Requested page clamped to the range of pages that exist (at least 1). */
  page: number;
  pageItems: T[];
  totalPages: number;
};

/**
 * Slices `items` for the requested page. When the list shrinks (an item is
 * deleted, or a status change drops it out of the active filter) the requested
 * page may no longer exist, so it is clamped to the last available page
 * instead of returning an empty slice.
 */
export const paginate = <T>(
  items: T[],
  requestedPage: number,
  itemsPerPage: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const lastPage = Math.max(totalPages, 1);
  const page = Math.min(Math.max(requestedPage, 1), lastPage);
  const startIndex = (page - 1) * itemsPerPage;

  return {
    page,
    pageItems: items.slice(startIndex, startIndex + itemsPerPage),
    totalPages,
  };
};
