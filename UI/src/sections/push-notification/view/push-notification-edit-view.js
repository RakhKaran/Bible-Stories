// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PushNotificationNewEditForm from '../push-notification-new-edit-form';

// ----------------------------------------------------------------------

export default function PushNotificationEditView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New Notification"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'List',
            href: paths.dashboard.pushNotification.list,
          },
          {
            name: 'Notification',
            href: paths.dashboard.pushNotification.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PushNotificationNewEditForm />
    </Container>
  );
}
