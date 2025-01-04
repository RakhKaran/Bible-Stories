// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import CategoryNewEditForm from '../category-new-edit-form';

// ----------------------------------------------------------------------

export default function CategoryEditView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New Category"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'List',
            href: paths.dashboard.category.list,
          },
          {
            name: 'Category',
            href: paths.dashboard.category.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CategoryNewEditForm />
    </Container>
  );
}
