import { Helmet } from 'react-helmet-async';
// sections
import { StoryListView } from 'src/sections/stories/view';
// ----------------------------------------------------------------------

export default function StoryListPage() {
  return (
    <>
      <Helmet>
        <title> Story List</title>
      </Helmet>

      <StoryListView />
    </>
  );
}
