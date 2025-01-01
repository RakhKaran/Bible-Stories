import { Helmet } from 'react-helmet-async';
// sections
import LanguageListView from 'src/sections/languages/view/language-list-view';
// ----------------------------------------------------------------------

export default function LanguageListPage() {
  return (
    <>
      <Helmet>
        <title> Language List</title>
      </Helmet>

      <LanguageListView />
    </>
  );
}
