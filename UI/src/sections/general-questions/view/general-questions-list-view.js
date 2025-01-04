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
import {  useRouter } from 'src/routes/hook';
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
import { RouterLink } from 'src/routes/components';
// api
import { useGetGeneralQuestionsList } from 'src/api/general-question/general-question';
import { useGetLanguageList } from 'src/api/language-api/language';
//
import GeneralQuestionsTableRow from '../general-questions-table-row';
import GeneralQuestionsTableToolbar from '../general-questions-table-toolbar';
import GeneralQuestionsTableFiltersResult from '../general-questions-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'question', label: 'Question', width:'600' },
  { id: 'audio', label: 'Audio'},
  { id: 'Language', label: 'Language'},
  { id: 'createdAt', label: 'Create at', width: 160 },
  // { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const languageId = localStorage.getItem('audioLanguage');

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
  language: Number(languageId) || undefined,
};

// ----------------------------------------------------------------------

export default function GeneralQuestionsListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [languagesData, setLanguagesData] = useState([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState(undefined);
  const [filters, setFilters] = useState(defaultFilters);
  const {generalQuestions, generalQuestionsEmpty, refreshGeneralQuestions} = useGetGeneralQuestionsList();
  const {languages, languagesEmpty} = useGetLanguageList();

  // stories..
  useEffect(() => {
    if(generalQuestions && !generalQuestionsEmpty){
      setTableData(generalQuestions);
    }
  },[generalQuestions, generalQuestionsEmpty]);

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
        refreshGeneralQuestions();
      }
    }catch(error){
      console.error(error);
    }
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="General Question List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'General Question', href: paths.dashboard.question.list },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.question.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Question
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <GeneralQuestionsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            languagesData = {languagesData}
            onChangeLanguage = {(langId) => onChangeLanguage(langId)}
          />

          {canReset && (
            <GeneralQuestionsTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
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
                      <GeneralQuestionsTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onRefreshGeneralQuestions={() => refreshGeneralQuestions()}
                        activeAudioIndex={activeAudioIndex}
                        setActiveAudioIndex={setActiveAudioIndex}
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
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (question) => question.question.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }
  return inputData;
}
