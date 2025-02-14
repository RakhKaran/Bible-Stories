import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function CategoryQuickEditForm({ currentCategory, open, onClose, onRefreshCategories }) {
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

  useEffect(() => {
    if (open) {
      reset(defaultValues); // Reset form values to the latest currentCategory values
    }
  }, [open, currentCategory, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        categoryName : data.categoryName,
        description : data.description,
        isActive : data.status
      }

      if (data.image) {
        inputData.image = {
          fileUrl: data.image,
        };
      }

      const response = await axiosInstance.patch(`/categories/${currentCategory?.id}`, inputData);
      if(response?.data?.success){
        reset();
        onRefreshCategories();
        onClose();
        enqueueSnackbar('Update success!');
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
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            sx={{marginTop : '8px'}}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              <MenuItem value>
                Active
              </MenuItem>
              <MenuItem value={false}>
                In-Active
              </MenuItem>
            </RHFSelect>

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
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

CategoryQuickEditForm.propTypes = {
  currentCategory: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  onRefreshCategories: PropTypes.func
};
