import { Helmet } from 'react-helmet-async';
// sections
import { CategoryListView } from 'src/sections/categories/view';
// ----------------------------------------------------------------------

export default function CategoryListPage() {
  return (
    <>
      <Helmet>
        <title> Category List</title>
      </Helmet>

      <CategoryListView />
    </>
  );
}
