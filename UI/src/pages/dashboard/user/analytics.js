import { Helmet } from 'react-helmet-async';
// sections
import { UserAnalyticsView } from 'src/sections/user/view';
// ----------------------------------------------------------------------

export default function UserAnalyticsPage() {
  return (
    <>
      <Helmet>
        <title> User Analytics</title>
      </Helmet>

      <UserAnalyticsView />
    </>
  );
}
