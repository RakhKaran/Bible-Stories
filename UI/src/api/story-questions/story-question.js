import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetStoryQuestionsList(storyId) {
  const URL = endpoints.storyQuestions.list(storyId);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshStoryQuestions = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    storyQuestions: data?.data || [],
    storyQuestionsLoading: isLoading,
    storyQuestionsError: error,
    storyQuestionsValidating: isValidating,
    storyQuestionsEmpty: !isLoading && !data?.data.length,
    refreshStoryQuestions
  }
}

// ----------------------------------------------------------------------

export function useGetStoryQuestionsById(questionId) {
  const URL = questionId ? endpoints.storyQuestions.details(questionId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      storyQuestion: data?.data,
      storyQuestionLoading: isLoading,
      storyQuestionError: error,
      storyQuestionValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
