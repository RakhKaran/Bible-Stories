import { Helmet } from 'react-helmet-async';
// sections
import { GeneralQuestionsEditView } from 'src/sections/general-questions/view';
// ----------------------------------------------------------------------

export default function NewGeneralQuestionPage() {
  return (
    <>
      <Helmet>
        <title> General Question Create Page</title>
      </Helmet>

      <GeneralQuestionsEditView />
    </>
  );
}
