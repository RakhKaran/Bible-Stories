import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFUpload,
} from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function CategoryNewEditForm({ currentCategory }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewCategorySchema = Yup.object().shape({
    categoryName: Yup.string().required('Name is required'),
    description: Yup.string(),
    image: Yup.string().required('Category image is required'),
  });

  const defaultValues = useMemo(
    () => ({
      categoryName: currentCategory?.categoryName || '',
      description: currentCategory?.description || '',
      image: currentCategory?.image?.fileUrl || null,
      status: currentCategory?.isActive,
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        categoryName : data.categoryName,
        description : data.description,
        isActive : true
      }

      if(data.image) {
        inputData.image = {
          fileUrl: data.image,
        };
      }

      const response = await axiosInstance.post(`/categories`, inputData);
      if(response?.data?.success){
        reset();
        enqueueSnackbar('Update success!');
        router.replace(paths.dashboard.category.list);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      console.log(file);

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        setValue('image', data?.files[0].fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid justifyContent='center' container spacing={3}>
        <Grid justifyContent='center' xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField name="categoryName" label="Category Name" />
              <RHFTextField name="description" label="Description" multiline rows={3} />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Category Image</Typography>
                <RHFUpload
                  name="image"
                  maxSize={3145728}
                  onDrop={handleDrop}
                />
              </Stack>
            </Box>

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCategory ? 'Create Category' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

CategoryNewEditForm.propTypes = {
  currentCategory: PropTypes.object,
};
