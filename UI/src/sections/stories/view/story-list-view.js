import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import axiosInstance from 'src/utils/axios';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// api
import { useGetStoryList } from 'src/api/story-api/story';
import { useGetCategoriesList } from 'src/api/category-api/categories';
import { useGetLanguageList } from 'src/api/language-api/language';
//
import StoryTableRow from '../story-table-row';
import StoryTableToolbar from '../story-table-toolbar';
import StoryTableFiltersResult from '../story-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Title' },
  { id: 'audio', label: 'Audio'},
  { id: 'Language', label: 'Language'},
  { id: 'createdAt', label: 'Create at', width: 160 },
  // { id: 'status', label: 'Status', width: 100 },
  { id: ''},
  { id: '', width: 88 },
];

const languageId = localStorage.getItem('audioLanguage');

const defaultFilters = {
  name: '',
  category : undefined,
  role: [],
  status: 'all',
  language: Number(languageId) || undefined,
};

// ----------------------------------------------------------------------

export default function StoryListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [languagesData, setLanguagesData] = useState([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState(undefined);
  const [filters, setFilters] = useState(defaultFilters);
  const {stories, storiesEmpty, refreshStories} = useGetStoryList();
  const {categories, categoriesEmpty} = useGetCategoriesList();
  const {languages, languagesEmpty} = useGetLanguageList();

  // stories..
  useEffect(() => {
    if(stories && !storiesEmpty){
      setTableData(stories);
    }
  },[stories, storiesEmpty]);

  // categories..
  useEffect(() => {
    if(categories && !categoriesEmpty){
      setCategoriesData(categories);
    }
  },[categories, categoriesEmpty]);

  // languages..
  useEffect(() => {
    if(languages && !languagesEmpty){
      setLanguagesData(languages);
    }
  },[languages, languagesEmpty]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const onChangeLanguage = async (langId) => {
    try{
      const response = await axiosInstance.post('/users/set-lang',{audioLanguage : langId});
      if(response?.data?.success){
        localStorage.setItem('audioLanguage', langId);
        refreshStories();
      }
    }catch(error){
      console.error(error);
    }
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Story List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Story', href: paths.dashboard.story.root },
            { name: 'List' },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.user.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //   >
          //     New User
          //   </Button>
          // }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <StoryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            categoriesData = {categoriesData}
            languagesData = {languagesData}
            onChangeLanguage = {(langId) => onChangeLanguage(langId)}
          />

          {canReset && (
            <StoryTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              categoriesData = {categoriesData}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  checkBoxDisabled
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <StoryTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onRefreshStories={() => refreshStories()}
                        activeAudioIndex={activeAudioIndex}
                        setActiveAudioIndex={setActiveAudioIndex}
                        categoriesData = {categoriesData}
                        languagesData = {languagesData}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role, category } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (story) => story.title.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (category) {
    inputData = inputData.filter(
      (story) => story.categoryId === category
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.some((r) => user.permissions.includes(r)));
  }
  
  return inputData;
}
