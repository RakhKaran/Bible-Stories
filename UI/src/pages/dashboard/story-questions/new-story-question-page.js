import { Helmet } from 'react-helmet-async';
// sections
import { StoryQuestionsEditView } from 'src/sections/story-Questions/view';
// ----------------------------------------------------------------------

export default function NewStoryQuestionPage() {
  return (
    <>
      <Helmet>
        <title> Story Question Create Page</title>
      </Helmet>

      <StoryQuestionsEditView />
    </>
  );
}
