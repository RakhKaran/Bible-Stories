import { Helmet } from 'react-helmet-async';
// sections
import { StoryQuestionsListView } from 'src/sections/story-Questions/view';
// ----------------------------------------------------------------------

export default function StoryQuestionsListPage() {
  return (
    <>
      <Helmet>
        <title> Story Questions List</title>
      </Helmet>

      <StoryQuestionsListView />
    </>
  );
}
