// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import StoryNewEditForm from '../story-new-edit-form';

// ----------------------------------------------------------------------

export default function StoryEditView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New Story"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'List',
            href: paths.dashboard.story.list,
          },
          {
            name: 'Story',
            href: paths.dashboard.story.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StoryNewEditForm />
    </Container>
  );
}
