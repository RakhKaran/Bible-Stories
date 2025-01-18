import { Helmet } from 'react-helmet-async';
// sections
import { PushNotificationListView } from 'src/sections/push-notification/view';
// ----------------------------------------------------------------------

export default function PushNotificationsListPage() {
  return (
    <>
      <Helmet>
        <title> Push Notification List</title>
      </Helmet>

      <PushNotificationListView />
    </>
  );
}
