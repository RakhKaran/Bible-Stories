import { Helmet } from 'react-helmet-async';
// sections
import { StoryCommentView } from 'src/sections/comments/view';
// ----------------------------------------------------------------------

export default function CommentsListPage() {
  return (
    <>
      <Helmet>
        <title> comments</title>
      </Helmet>

      <StoryCommentView />
    </>
  );
}
