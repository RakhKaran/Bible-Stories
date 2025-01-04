import useSWR, { mutate } from 'swr';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCommentsList(storyId, limit, skip) {
  const URL = endpoints.comments.list(storyId, limit, skip);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshComments = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    comments: data?.data || [],
    commentsCount: data?.commentsCount || 0,
    commentsLoading: isLoading,
    commentsError: error,
    commentsValidating: isValidating,
    commentsEmpty: !isLoading && !data?.data.length,
    refreshComments
  }
}

// ----------------------------------------------------------------------

export function useGetCommentRepliesList(commentId, limit, skip) {
  const URL = endpoints.comments.replyList(commentId, limit, skip);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refreshCommentsReplies = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate(URL);
  };

  return{
    replies: data?.data || [],
    repliesCount: data?.repliesCount || 0,
    repliesLoading: isLoading,
    repliesError: error,
    repliesValidating: isValidating,
    repliesEmpty: !isLoading && !data?.data.length,
    refreshCommentsReplies
  }
}