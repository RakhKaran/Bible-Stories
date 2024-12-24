/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosInstance from 'src/utils/axios';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { IconButton, InputAdornment, Link } from '@mui/material';
import { useSnackbar } from 'notistack';

// components
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form';
import { EmailInboxIcon } from 'src/assets/icons';
import { useRouter, useSearchParams } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function FirebaseUpdatePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  const password = useBoolean();

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'Password must be at least 8 characters')
      .test(
        'no-match',
        'New password must be different than old password',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await axiosInstance.patch('/update-new-password',{email, password : data.newPassword});
      if(response?.data?.success){
        enqueueSnackbar(response?.data?.message, {variant : 'success'});
        router.replace(paths.auth.firebase.login);
      }else{
        enqueueSnackbar(response?.data?.message,{variant : 'error'});
        setValue('newPassword','');
        setValue('confirmNewPassword', '');
      }
    } catch (error) {
      if (typeof error !== 'string' && error?.error?.statusCode === 500) {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      } else {
        enqueueSnackbar(
          typeof error === 'string'
            ? error
            : error?.error?.message
            ? error?.error?.message
            : error?.message,
          { variant: 'error' }
        );
      }
    }
  });


  const renderHead = (
    <>
      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />
      <Typography variant="h3" sx={{ mb: 1 }}>
        Please check your email!
      </Typography>

      <Stack spacing={1} sx={{ color: 'text.secondary', typography: 'body2', mb: 5 }}>
        <Box component="span"> Please Enter New Password To Reset Password</Box>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3} alignItems="center">
        <RHFTextField
          name="newPassword"
          label="New Password"
          type={password.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Password must be minimum
              8+
            </Stack>
          }
        />

        <RHFTextField
          name="confirmNewPassword"
          type={password.value ? 'text' : 'password'}
          label="Confirm New Password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Set password
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
