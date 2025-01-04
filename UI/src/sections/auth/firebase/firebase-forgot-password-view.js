import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// auth
import { useAuthContext } from 'src/auth/hooks';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function FirebaseForgotPasswordView() {
  const { forgotPassword } = useAuthContext();

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();


  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: '',
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
      const response = await axiosInstance.post('/forget-password',{email : data.email});
      if(response?.data?.success){
        enqueueSnackbar(response?.data?.message, {variant : 'success'});
        const searchParams = new URLSearchParams({ email: data.email }).toString();
        const href = `${paths.auth.firebase.verify}?${searchParams}`;
        router.push(href);
      }else{
        enqueueSnackbar(response?.data?.message, {variant : 'error'});
        setValue('email','');
      }
    } catch (error) {
      if (typeof error !== 'string' && error?.error?.statusCode === 500) {
        enqueueSnackbar('Something went wrong', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          // eslint-disable-next-line no-nested-ternary
          typeof error === 'string'
            ? error
            : error?.error?.message
            ? error?.error?.message
            : error?.message,
          {
            variant: 'error',
          }
        );
      }
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Send Request
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.firebase.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Forgot your password?</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please enter the email address associated with your account and We will email you a otp
          to reset your password.
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
