import { Helmet } from 'react-helmet-async';
// sections
import { GeneralQuestionsListView } from 'src/sections/general-questions/view';
// ----------------------------------------------------------------------

export default function GeneralQuestionsListPage() {
  return (
    <>
      <Helmet>
        <title> General Questions List</title>
      </Helmet>

      <GeneralQuestionsListView />
    </>
  );
}
