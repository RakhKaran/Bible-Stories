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
import { Link } from '@mui/material';
import { useSnackbar } from 'notistack';

// components
import FormProvider, { RHFCode } from 'src/components/hook-form';
import { EmailInboxIcon } from 'src/assets/icons';
import { useRouter, useSearchParams } from 'src/routes/hook';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function FirebaseVerifyView() {
  const [otpVerified, setIsOtpVerified] = useState(false);
  const [resendOtp, setResendOtp] = useState(false);
  const [resendOtpCooldown, setResendOtpCooldown] = useState(false);  // Cooldown state
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  const ForgotPasswordSchema = Yup.object().shape({
    code: Yup.string()
      .required('OTP is required')
      .matches(/^\d{6}$/, 'OTP must be a 6-digit number'),
  });

  const defaultValues = {
    code: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await axiosInstance.post('/reset-password', { email, otp: data.code });
      if (response?.data.success) {
        setIsOtpVerified(true);
        enqueueSnackbar(response?.data?.message, { variant: 'success' });
        const searchParamsEmail = new URLSearchParams({ email }).toString();
        const href = `${paths.auth.firebase.updateNewPassword}?${searchParamsEmail}`
        router.replace(href);
      } else if (!response?.data?.success) {
        enqueueSnackbar(response?.data?.message, { variant: 'error' });
        setValue('code', '');
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

  const handleResendOtp = async () => {
    try {
      const response = await axiosInstance.post('/forget-password', { email });
      if (response?.data?.success) {
        setValue('code', '');
        enqueueSnackbar(response?.data?.message, { variant: 'success' });
        setResendOtp(true);

        // Start cooldown for 20 seconds
        setResendOtpCooldown(true);
        setTimeout(() => {
          setResendOtpCooldown(false);  // Re-enable button after 20 seconds
        }, 20000);  // 20 seconds cooldown
      } else {
        enqueueSnackbar(response?.data?.message, { variant: 'error' });
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
  };

  const renderHead = (
    <>
      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />
      <Typography variant="h3" sx={{ mb: 1 }}>
        Please check your email!
      </Typography>

      <Stack spacing={1} sx={{ color: 'text.secondary', typography: 'body2', mb: 5 }}>
        <Box component="span"> We have sent a confirmation otp to reset password</Box>
        <Box component="strong" sx={{ color: 'text.primary' }}>
          {email}
        </Box>
        <Box component="div">Please check your inbox/spam.</Box>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFCode name="code" />
      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Verify Otp
      </LoadingButton>
      <Typography variant="body2">
        Do not receive otp yet?{' '}
        <Link
          onClick={() => handleResendOtp()}
          sx={{
            pointerEvents: resendOtpCooldown ? 'none' : 'auto', // Disable clicks during cooldown
            color: resendOtpCooldown ? 'gray' : 'primary.main', // Change color to indicate disabled state
            cursor: resendOtpCooldown ? 'not-allowed' : 'pointer', // Change cursor style when disabled
          }}
        >
          Resend OTP
        </Link>
      </Typography>
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
