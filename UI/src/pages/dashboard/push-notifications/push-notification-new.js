import { Helmet } from 'react-helmet-async';
// sections
import { PushNotificationEditView } from 'src/sections/push-notification/view';
// ----------------------------------------------------------------------

export default function NewPushNotificationPage() {
  return (
    <>
      <Helmet>
        <title> Push Notification Create Page</title>
      </Helmet>

      <PushNotificationEditView />
    </>
  );
}
