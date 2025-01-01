import { Helmet } from 'react-helmet-async';
// sections
import { CategoryEditView } from 'src/sections/categories/view';
// ----------------------------------------------------------------------

export default function CategoryCreatePage() {
  return (
    <>
      <Helmet>
        <title> New Category Page</title>
      </Helmet>

      <CategoryEditView />
    </>
  );
}