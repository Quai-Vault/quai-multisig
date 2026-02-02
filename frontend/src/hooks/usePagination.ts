import { useState, useCallback, useEffect } from 'react';

export interface UsePaginationOptions {
  initialLimit?: number;
  initialOffset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface UsePaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  page: number;
  limit: number;
  loadMore: () => void;
  reset: () => void;
  setPage: (page: number) => void;
}

/**
 * Hook for managing pagination state with async data fetching
 *
 * @param fetchFn - Function that fetches paginated data
 * @param options - Pagination options (limit, initial offset)
 */
export function usePagination<T>(
  fetchFn: (options: { limit: number; offset: number }) => Promise<PaginatedResult<T>>,
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { initialLimit = 20 } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPageState] = useState(0);
  const limit = initialLimit;

  const loadPage = useCallback(
    async (pageNum: number, append = false) => {
      setIsLoading(true);
      try {
        const result = await fetchFn({
          limit,
          offset: pageNum * limit,
        });

        setData((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPageState(pageNum);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, limit]
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(page + 1, true);
    }
  }, [isLoading, hasMore, page, loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setTotal(0);
    setHasMore(true);
    setPageState(0);
    loadPage(0);
  }, [loadPage]);

  const setPage = useCallback(
    (newPage: number) => {
      loadPage(newPage);
    },
    [loadPage]
  );

  // Load initial page on mount
  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  return {
    data,
    total,
    hasMore,
    isLoading,
    page,
    limit,
    loadMore,
    reset,
    setPage,
  };
}
