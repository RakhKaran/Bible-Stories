import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function LanguageNewEditForm({ currentLanguage }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewLanguageSchema = Yup.object().shape({
    langName: Yup.string().required('Name is required'),
    nativeLangName: Yup.string(),
    code: Yup.string().required('Code is required'),
  });

  const defaultValues = useMemo(
    () => ({
      langName: currentLanguage?.langName || '',
      nativeLangName: currentLanguage?.nativeLangName || '',
      code: currentLanguage?.code || '',
      status: currentLanguage?.isActive,
    }),
    [currentLanguage]
  );

  const methods = useForm({
    resolver: yupResolver(NewLanguageSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        langName : data.langName,
        nativeLangName : data.nativeLangName,
        code : data.code,
        isActive : true
      }
      const response = await axiosInstance.post('/create-language', inputData);
      if(response?.data?.success){
        reset();
        enqueueSnackbar(currentLanguage ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.language.list);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="langName" label="Language Name" />
              <RHFTextField name="nativeLangName" label="Native Language Name" />
              <RHFTextField name="code" label="Code" />
            </Box>

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentLanguage ? 'Add Language' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

LanguageNewEditForm.propTypes = {
  currentLanguage: PropTypes.object,
};
