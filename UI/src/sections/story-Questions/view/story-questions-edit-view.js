import { useParams } from 'react-router';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import StoryQuestionsNewEditForm from '../story-questions-new-edit-form';

// ----------------------------------------------------------------------

export default function StoryQuestionsEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const {storyId} = params;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New Story Question"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'List',
            href: paths.dashboard.story.questionList(storyId),
          },
          {
            name: 'Story Question',
            href: paths.dashboard.story.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StoryQuestionsNewEditForm storyId={storyId} />
    </Container>
  );
}
