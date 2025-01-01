import { Helmet } from 'react-helmet-async';
// sections
import { StoryEditView } from 'src/sections/stories/view';
// ----------------------------------------------------------------------

export default function NewStoryPage() {
  return (
    <>
      <Helmet>
        <title> Story Create Page</title>
      </Helmet>

      <StoryEditView />
    </>
  );
}
