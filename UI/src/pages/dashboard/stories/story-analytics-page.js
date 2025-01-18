import { Helmet } from 'react-helmet-async';
// sections
import { StoryAnalyticsView } from 'src/sections/stories/view';
// ----------------------------------------------------------------------

export default function StoryAnalyticsPage() {
  return (
    <>
      <Helmet>
        <title> Story Analytics</title>
      </Helmet>

      <StoryAnalyticsView />
    </>
  );
}
