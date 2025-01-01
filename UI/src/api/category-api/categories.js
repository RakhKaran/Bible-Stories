import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCategoriesList() {
  const URL = endpoints.categories.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshCategories = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    categories: data || [],
    categoriesLoading: isLoading,
    categoriesError: error,
    categoriesValidating: isValidating,
    categoriesEmpty: !isLoading && !data?.length,
    refreshCategories
  }
}

// ----------------------------------------------------------------------

export function useGetCategoryById(categoryId) {
  const URL = categoryId ? endpoints.categories.details(categoryId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      categories: data,
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
