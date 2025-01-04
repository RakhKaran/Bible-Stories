// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import GeneralQuestionsNewEditForm from '../general-questions-new-edit-form';

// ----------------------------------------------------------------------

export default function GeneralQuestionsEditView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New Question"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'List',
            href: paths.dashboard.question.list,
          },
          {
            name: 'General Question',
            href: paths.dashboard.question.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <GeneralQuestionsNewEditForm />
    </Container>
  );
}
