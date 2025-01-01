/* eslint-disable jsx-a11y/media-has-caption */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Button, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFUpload,
  RHFUploadAudio,
} from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useGetLanguageList } from 'src/api/language-api/language';
import { useGetCategoriesList } from 'src/api/category-api/categories';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function StoryNewEditForm({ currentStory }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [languageData, setLanguageData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [newAudio, setNewAudio] = useState({
    language: {},
    audio: {},
    duration: undefined,
  });
  const { languages, languagesEmpty } = useGetLanguageList();
  const { categories, categoriesEmpty } = useGetCategoriesList();

  // languages...
  useEffect(() => {
    if (languages && !languagesEmpty) {
      setLanguageData(languages);
    }
  }, [languages, languagesEmpty]);

  // categories...
  useEffect(() => {
    if (categories && !categoriesEmpty) {
      setCategoriesData(categories);
    }
  }, [categories, categoriesEmpty]);

  const NewStorySchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    subTitle: Yup.string().required('Subtitle is required'),
    category: Yup.number().required('Please select category'),
    audios: Yup.array()
      .of(
        Yup.object().shape({
          language: Yup.object().required('Language is required'),
          audio: Yup.object().shape({
            fileUrl: Yup.string().required('Audio file URL is required'),
            fileName: Yup.string().required('Audio file name is required'),
          }),
          duration: Yup.number().required('Duration is required').min(1),
        })
      )
      .required('At least one audio entry is required'),
    images: Yup.array()
      .of(
        Yup.object().shape({
          fileUrl: Yup.string().required('Image file URL is required'),
          fileName: Yup.string().required('Image file name is required'),
        })
      )
      .required('At least one image is required'),
    // audio: Yup.object().required('Audio is required'),
    // language : Yup.object().required('Language is required'),
    // duration : Yup.number().required('Duration is required')
  });

  const defaultValues = useMemo(
    () => ({
      title: currentStory?.title || '',
      subTitle: currentStory?.subTitle || '',
      category: currentStory?.categoryId || undefined,
      audios: currentStory?.audios || [],
      images: currentStory?.images || [],
      language: undefined,
      audio : undefined,
      duration: undefined
    }),
    [currentStory]
  );

  const methods = useForm({
    resolver: yupResolver(NewStorySchema),
    defaultValues,
  });

  const {
    control,
    reset,
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  console.log('values', values);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'audios',
  });

  const handleAddNewAudio = () => {
    if (newAudio.language && newAudio.audio && newAudio.duration) {
      append(newAudio);
      setNewAudio({ language: undefined, audio: {}, duration: undefined });
      setValue('language', undefined);
      setValue('audio', {});
      setValue('duration', undefined);
      reset({
        ...methods.getValues()
      });
    } else {
      enqueueSnackbar('Please fill in all fields.', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        title : data.title,
        subTitle : data.subTitle,
        images : data.images,
        audios : data.audios,
        categoryId : data.category
      };

      const response = await axiosInstance.post(`/stories`, inputData);
      if (response?.data?.success) {
        reset();
        enqueueSnackbar('Update success!');
        router.replace(paths.dashboard.story.list);
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
      const images = values.images || [];
      const newFiles = [];
  
      // Use Promise.all to wait for all async operations to complete
      await Promise.all(
        acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          try {
            const response = await axiosInstance.post('/files', formData);
            const { data } = response;
            newFiles.push({
              fileName: data?.files[0].fileName,
              fileUrl: data?.files[0].fileUrl,
              preview : data?.files[0].fileUrl,
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            // Handle error as needed
          }
        })
      );
  
      console.log('newFiles', newFiles);
  
      // Update the state or values with the array of file URLs
      if (newFiles.length > 0) {
        setValue('images', [...images, ...newFiles], { shouldValidate: true });
      }
    },
    [setValue, values.images]
  );

  const handleDropAudio = useCallback(
    async (acceptedFiles, index) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        setNewAudio({
          ...newAudio,
          audio: {
            fileName: data?.files[0].fileName,
            fileUrl: data?.files[0].fileUrl,
          },
        });
        setValue(
          `audio`,
          {
            fileName: data?.files[0].fileName,
            fileUrl: data?.files[0].fileUrl,
          },
          {
            shouldValidate: true,
          }
        );
      }
    },
    [setValue, newAudio]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid justifyContent="center" container spacing={3}>
        <Grid justifyContent="center" xs={12} md={8}>
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
              <RHFTextField name="title" label="Title" />
              <RHFTextField name="subTitle" label="Subtitle" />
              <RHFSelect name="category" label="Category">
                {categoriesData.length > 0 &&
                  categoriesData.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
              </RHFSelect>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Images</Typography>
                <RHFUpload
                  multiple
                  name="images"
                  maxSize={3145728}
                  thumbnail
                  onDrop={handleDrop}
                  onRemove={(inputFile) =>
                    setValue(
                      'images',
                      values.images &&
                        values.images?.filter((file) => file !== inputFile),
                      { shouldValidate: true }
                    )
                  }
                  onRemoveAll={() => setValue('images', [], { shouldValidate: true })}
                />
              </Stack>
              <Typography variant="subtitle2">Audios</Typography>
              <Stack spacing={2}>
                <Stack spacing={2}>
                  <RHFSelect
                    name="language"
                    label="Language"
                    onChange={(e) => setNewAudio({ ...newAudio, language: e.target.value })}
                  >
                    {languageData.length > 0 &&
                      languageData.map((lang) => (
                        <MenuItem key={lang.id} value={lang}>
                          {`${lang.langName} (${lang.nativeLangName})`}
                        </MenuItem>
                      ))}
                  </RHFSelect>
                  <RHFUploadAudio name="audio" onDrop={(files) => handleDropAudio(files)} />
                  <RHFTextField
                    name="duration"
                    label="Duration (in seconds)"
                    type="number"
                    onChange={(e) => setNewAudio({ ...newAudio, duration: e.target.value })}
                  />
                  <LoadingButton
                    variant="outlined"
                    color="error"
                    onClick={() => setNewAudio({ language: newAudio.language, audio: {}, duration: undefined })}
                  >
                    Remove Audio
                  </LoadingButton>
                </Stack>
                <LoadingButton variant="contained" onClick={() => handleAddNewAudio()}>
                  Add Audio
                </LoadingButton>
              </Stack>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: 'center' }}>Language</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Audio</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map(
                  (audio, index) =>
                    audio.language && audio.audio.fileUrl && (
                      <TableRow key={index}>
                        <TableCell sx={{ textAlign: 'center' }}>{audio?.language?.langName}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <audio controls src={audio?.audio?.fileUrl} preload="metaData" />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            sx={{
                              backgroundColor: 'orange',
                              borderColor: 'orange',
                              outlineColor: 'orange',
                              color: 'white',
                            }}
                            variant="contained"
                            onClick={() => {
                              // Set the selected audio data for editing
                              setNewAudio({
                                language: audio.language,
                                audio: audio.audio,
                                duration: audio.duration,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            sx={{
                              backgroundColor: 'red',
                              borderColor: 'red',
                              outlineColor: 'red',
                              color: 'white',
                            }}
                            variant="contained"
                            onClick={() => remove(index)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentStory ? 'Create Story' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

StoryNewEditForm.propTypes = {
  currentStory: PropTypes.object,
};
