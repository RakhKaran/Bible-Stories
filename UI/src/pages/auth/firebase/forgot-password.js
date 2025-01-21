import { Helmet } from 'react-helmet-async';
// sections
import { FirebaseForgotPasswordView } from 'src/sections/auth/firebase';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Bible Stories: Forgot Password</title>
      </Helmet>

      <FirebaseForgotPasswordView />
    </>
  );
}
