import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetUsersList() {
  const URL = endpoints.users.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshUsers = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    users: data?.data || [],
    usersLoading: isLoading,
    usersError: error,
    usersValidating: isValidating,
    usersEmpty: !isLoading && !data?.data.length,
    refreshUsers
  }
}

// ----------------------------------------------------------------------

export function useGetUserById(userId) {
  const URL = userId ? endpoints.users.details(userId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      user: data?.data,
      userLoading: isLoading,
      userError: error,
      userValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
