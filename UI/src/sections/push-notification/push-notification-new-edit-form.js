/* eslint-disable array-callback-return */
/* eslint-disable no-useless-catch */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useState } from 'react';
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
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {  RHFAutocomplete, RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { Autocomplete, Checkbox, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function PushNotificationNewEditForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [usersData, setUsersData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [optionsData, setOptionsData] = useState([]);

  const fetchUsersData = async () => {
    try {
      const response = await axiosInstance.get('/push-notifications/users-list');
      if (response?.data?.success) {
        setUsersData(response?.data?.data);
      }
    } catch (error) {
      console.error('Failed to fetch users data:', error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchCategoriesOrStories = async (option) => {
    try {
      const response = await axiosInstance.get(`/fetch-optional-data/${option}`);
      
      if (response.data.success) {
        console.log(response.data.data);
        const optData = response.data.data.map((data) => ({
          value: data.id,
          label: option === 'category' ? data.categoryName : data.title,
        }));
        setOptionsData(optData);
      }
    } catch (error) {
      console.error('Error fetching categories or stories:', error);
    }
  };

  useEffect(() => {
    if(selectedOption && selectedOption !== 'none'){
      fetchCategoriesOrStories(selectedOption);
    }
  },[selectedOption])

  const PushNotificationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    messageBody: Yup.string(),
    image: Yup.string(),
    targetUsers: Yup.array()
      .of(Yup.number().required('User ID is required'))
      .min(1, 'At least one user must be selected'),
      selectedOptionData: Yup.number()
      // .transform((originalValue, originalObject) => {
      //   // Only transform if selectedOption is category or story
      //   if (originalObject.selectedOption && originalObject.selectedOption !== 'none') {
      //     return Number.isNaN(originalValue) ? undefined : Number(originalValue); // Convert to number or undefined
      //   }
      //   return originalValue; // Don't transform if not category or story
      // })
      .when('selectedOption', {
        is: (val) => val === 'category' || val === 'story',
        then: (schema) => schema.required('Please select a valid option'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  const defaultValues = {
    title: '',
    messageBody: '',
    // image: `${HOST_API}/files/logo.png`,
    image: `${HOST_API}/files/20250118T125804409Z_WhatsApp Image 2024-12-12 at 2.25.58 PM.png`,
    targetUsers: [],
    status: 'pending',
  };

  const methods = useForm({
    resolver: yupResolver(PushNotificationSchema),
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
        title: data.title,
        messageBody: data.messageBody,
        targetUsers: data.targetUsers,
        status: 'pending',
      };

      if(data.image){
        inputData.image = {
          fileUrl : data.image
        }
      }

      if(selectedOption === 'category' || selectedOption === 'story'){
        if(!data.selectedOptionData){
          enqueueSnackbar('Please select option', {variant : 'error'});
          return;
        }
        inputData.optionalData = {
          type : selectedOption,
          value : data.selectedOptionData
        }
      }

      const response = await axiosInstance.post('/push-notifications', inputData);
      if (response?.data?.success) {
        reset();
        enqueueSnackbar('Notification sent successfully!');
        router.replace(paths.dashboard.pushNotification.list);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      enqueueSnackbar(error?.message || 'Failed to send notification', { variant: 'error' });
    }
  });

  const handleUserSelection = (event, selectedOptions) => {
    // Check if "All Users" is selected
    if (selectedOptions.some((option) => option.value === 'all')) {
      // Select all users and add them to the form's state
      const allUsers = usersData.map((user) => ({ label: user.firstName, id: user.id }));
      setValue('targetUsers', allUsers.map((user) => user.id), { shouldValidate: true });
      setSelectedUsers([{ label: 'All Users', value: 'all' }, ...allUsers]);
    } else {
      // Select specific users and update the state
      const selectedIds = selectedOptions.map((option) => option.id);
      setValue('targetUsers', selectedIds, { shouldValidate: true });
      setSelectedUsers(selectedOptions);
    }
  };

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axiosInstance.post('/files', formData);
          const { data } = response;
          setValue('image', data?.files[0]?.fileUrl, { shouldValidate: true });
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid justifyContent="center" container spacing={3}>
        <Grid xs={12} md={8}>
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
              <RHFTextField name="title" label="Notification Title" />
              <RHFTextField
                name="messageBody"
                label="Message Body"
                multiline
                rows={3}
              />

              {/* Autocomplete for selecting users */}
              <Autocomplete
                multiple
                options={[
                  { label: 'All Users', value: 'all' },
                  ...usersData.map((user) => ({
                    label: user.firstName,
                    id: user.id,
                  })),
                ]}
                value={selectedUsers}
                onChange={handleUserSelection}
                renderOption={(props, option) => {
                  const isSelected =
                    option.value === 'all'
                      ? selectedUsers.some((user) => user.value === 'all')
                      : selectedUsers.some((user) => user.id === option.id);

                  return (
                    <li {...props}>
                      <Checkbox
                        checked={isSelected}
                        style={{ marginRight: 8 }}
                      />
                      {option.label}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Users"
                    placeholder="Search and select users"
                  />
                )}
              />

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Notification Image</Typography>
                <RHFUpload
                  name="image"
                  maxSize={3145728}
                  onDrop={handleDrop}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Optional data</Typography>
                <FormControl fullWidth>
                  <InputLabel 
                    id="select-label" 
                    sx={{
                      zIndex: selectedOption ? 1 : 0,
                    }}
                  >
                    Select Type
                  </InputLabel>
                  <Select
                    label="Select Type"
                    labelId="select-label"
                    id="select"
                    value={selectedOption}
                    onChange={(e) => {
                      if(e.target.value !== 'category' && e.target.value !== 'story'){
                        setOptionsData([]);
                      }
                      setSelectedOption(e.target.value);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="story">Story</MenuItem>
                  </Select>
                </FormControl>
                {optionsData.length > 0 && (
                  <RHFAutocomplete
                  name="selectedOptionData"
                  label="Select option"
                  placeholder="Choose an option"
                  options={optionsData}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  onChange={(_, newValue) => {
                    // Set the value as only the option's value (number), not the whole object
                    setValue('selectedOptionData', newValue ? newValue.value : undefined);
                  }}
                />
                )}
              </Stack>
            </Box>

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Create Notification
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

