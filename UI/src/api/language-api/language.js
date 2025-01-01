import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetLanguageList() {
  const URL = endpoints.languages.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshLanguages = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    languages: data?.data || [],
    languagesLoading: isLoading,
    languagesError: error,
    languagesValidating: isValidating,
    languagesEmpty: !isLoading && !data?.data.length,
    refreshLanguages
  }
}

// ----------------------------------------------------------------------

export function useGetLanguageById(languageId) {
  const URL = languageId ? endpoints.languages.languageId(languageId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      language: data?.data,
      languageLoading: isLoading,
      languageError: error,
      languageValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
