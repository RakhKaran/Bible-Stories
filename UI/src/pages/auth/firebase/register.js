import { Helmet } from 'react-helmet-async';
// sections
import { FirebaseRegisterView } from 'src/sections/auth/firebase';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Bible Stories: Register</title>
      </Helmet>

      <FirebaseRegisterView />
    </>
  );
}
