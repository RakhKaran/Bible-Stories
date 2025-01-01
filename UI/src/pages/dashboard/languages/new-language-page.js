import { Helmet } from 'react-helmet-async';
// sections
import LanguageEditView from 'src/sections/languages/view/language-edit-view';
// ----------------------------------------------------------------------

export default function NewLanguagePage() {
  return (
    <>
      <Helmet>
        <title> Language Create Page</title>
      </Helmet>

      <LanguageEditView />
    </>
  );
}
