import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetStoryList() {
  const URL = endpoints.stories.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshStories = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    stories: data?.data || [],
    storiesLoading: isLoading,
    storiesError: error,
    storiesValidating: isValidating,
    storiesEmpty: !isLoading && !data?.data.length,
    refreshStories
  }
}

// ----------------------------------------------------------------------

export function useGetStoryById(storyId, open) {
  const URL = storyId ? endpoints.stories.details(storyId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      story: data?.data,
      storyLoading: isLoading,
      storyError: error,
      storyValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
