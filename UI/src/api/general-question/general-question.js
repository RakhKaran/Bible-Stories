import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetGeneralQuestionsList() {
  const URL = endpoints.generalQuestions.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshGeneralQuestions = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    generalQuestions: data?.data || [],
    generalQuestionsLoading: isLoading,
    generalQuestionsError: error,
    generalQuestionsValidating: isValidating,
    generalQuestionsEmpty: !isLoading && !data?.data.length,
    refreshGeneralQuestions
  }
}

// ----------------------------------------------------------------------

export function useGetGeneralQuestionsById(questionId) {
  const URL = questionId ? endpoints.generalQuestions.details(questionId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      generalQuestion: data?.data,
      generalQuestionLoading: isLoading,
      generalQuestionError: error,
      generalQuestionValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
