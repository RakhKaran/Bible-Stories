import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetPushNotificationList() {
  const URL = endpoints.pushNotification.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshPushNotification= () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    pushNotification: data?.data || [],
    pushNotificationLoading: isLoading,
    pushNotificationError: error,
    pushNotificationValidating: isValidating,
    pushNotificationEmpty: !isLoading && !data?.data.length,
    refreshPushNotification
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
