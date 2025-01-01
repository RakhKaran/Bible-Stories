import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
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
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function LanguageQuickEditForm({ currentLanguage, open, onClose, onRefreshLanguages }) {
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

  useEffect(() => {
    if (open) {
      reset(defaultValues); // Reset form values to the latest currentLanguage values
    }
  }, [open, currentLanguage, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        langName : data.langName,
        nativeLangName : data.nativeLangName,
        code : data.code,
        isActive : data.status
      }

      const response = await axiosInstance.patch(`/update-language/${currentLanguage?.id}`, inputData);
      if(response?.data?.success){
        reset();
        onRefreshLanguages();
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
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              <MenuItem value>
                Active
              </MenuItem>
              <MenuItem value={false}>
                Not Active
              </MenuItem>
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="langName" label="Language Name" />
            <RHFTextField name="nativeLangName" label="Native Language Name" />
            <RHFTextField name="code" label="Language Code" />
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

LanguageQuickEditForm.propTypes = {
  currentLanguage: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  onRefreshLanguages: PropTypes.func
};
