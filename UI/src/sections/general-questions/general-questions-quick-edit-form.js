/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/media-has-caption */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAudio } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { Stack, TableBody, TableCell, TableHead, TableRow, Typography, Table } from '@mui/material';

// ----------------------------------------------------------------------

export default function StoryQuestionsQuickEditForm({ currentQuestionId, open, onClose, onRefreshGeneralQuestions,  languages }) {
  const { enqueueSnackbar } = useSnackbar();
  const languageData = languages;
  const [currentQuestion, setCurrentQuestion] = useState();
  const [newAudio, setNewAudio] = useState({
    language: null,
    audio: null,
    duration: undefined,
  });

  const fetchStoryQuestionById = async () => {
    try{
      const response = await axiosInstance.get(`/question-by-id-admin/${currentQuestionId}`);
      if(response?.data?.success){
        setCurrentQuestion(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    if(open && currentQuestionId){
      fetchStoryQuestionById();
    }
  },[open, currentQuestionId])

  const NewStoryQuestionSchema = Yup.object().shape({
      question: Yup.string().required('Question is required'),
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
    });

  const defaultValues = useMemo(
      () => ({
        question: currentQuestion?.question || '',
        audios: currentQuestion?.audios || [],
        language: undefined,
        audio : undefined,
        duration: undefined
      }),
      [currentQuestion]
    );

  const methods = useForm({
    resolver: yupResolver(NewStoryQuestionSchema),
    defaultValues,
  });

  const {
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'audios',
  });

  const handleAddNewAudio = () => {
    if (newAudio.language && newAudio.audio && newAudio.duration) {
      // Check if any field already exists with the same language code
      if (fields.length > 0) {
        const existingIndex = fields.findIndex(
          (audio) => audio?.language?.code === newAudio.language.code
        );
  
        if (existingIndex !== -1) {
          // Update the existing audio entry
          fields[existingIndex] = {
            ...fields[existingIndex],
            ...newAudio, // Merge with newAudio to update the details
          };
  
          // Update the form fields with updated array
          setValue('audios', [...fields]);
          enqueueSnackbar('Audio updated successfully.', { variant: 'success' });
        } else {
          // Append the new audio entry if no match is found
          append(newAudio);
          enqueueSnackbar('New audio added successfully.', { variant: 'success' });
        }
      } else {
        // If fields are empty, simply append
        append(newAudio);
        enqueueSnackbar('New audio added successfully.', { variant: 'success' });
      }
  
      // Reset the form and state
      setNewAudio({ language: null, audio: null, duration: undefined });
      setValue('language', null);
      setValue('audio', null);
      setValue('duration', undefined);
      reset({
        ...methods.getValues(),
      });
    } else {
      enqueueSnackbar('Please fill in all fields.', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, currentQuestion]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        question : data.question,
        audios : data.audios,
      };

      const response = await axiosInstance.patch(`/questions/${currentQuestionId}`, inputData);
      if(response?.data?.success){
        reset();
        onRefreshGeneralQuestions();
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

  // const handleDropAudio = useCallback(
  //   async (acceptedFiles, index) => {
  //     const file = acceptedFiles[0];
  //     if (file) {
  //       const formData = new FormData();
  //       formData.append('file', file);
  //       const response = await axiosInstance.post('/files', formData);
  //       const { data } = response;
  //       setNewAudio({
  //         ...newAudio,
  //         audio: {
  //           fileName: data?.files[0].fileName,
  //           fileUrl: data?.files[0].fileUrl,
  //         },
  //       });
  //       setValue(
  //         `audio`,
  //         {
  //           fileName: data?.files[0].fileName,
  //           fileUrl: data?.files[0].fileUrl,
  //         },
  //         {
  //           shouldValidate: true,
  //         }
  //       );
  //     }
  //   },
  //   [setValue, newAudio]
  // );

  const handleDropAudio = useCallback(
    async (acceptedFiles, index) => {
      const file = acceptedFiles[0];
      if (file) {
        // Upload the file to the server
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
  
        // Set audio details
        const fileUrl = data?.files[0]?.fileUrl;
        // Fetch audio duration
        const audio = new Audio(fileUrl);
        audio.addEventListener('loadedmetadata', () => {
          const {duration} = audio; // Duration in seconds
  
          // Set duration in form
          setValue('duration', duration);
          setValue(
            `audio`,
            {
              fileName: data?.files[0]?.fileName,
              fileUrl,
            },
            {
              shouldValidate: true,
            }
          );
          setNewAudio({
            ...newAudio,
            audio: {
              fileName: data?.files[0]?.fileName,
              fileUrl,
            },
            duration 
          });
        });
      }
    },
    [setValue, newAudio]
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
            <RHFTextField name="question" label="Question" multiline rows={3} />
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
                {/* <RHFTextField
                  name="duration"
                  label="Duration (in seconds)"
                  type="number"
                  onChange={(e) => setNewAudio({ ...newAudio, duration: e.target.value })}
                /> */}
                {/* <LoadingButton
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setNewAudio({ 
                      language: newAudio.language, 
                      audio: {}, 
                      duration: undefined 
                    });
                    setValue('language', undefined);
                    setValue('audio', null);
                    setValue('duration', undefined);
                  }}
                >
                  Remove Audio
                </LoadingButton> */}
              </Stack>
              <LoadingButton variant="contained" onClick={() => handleAddNewAudio()}>
                Add Audio
              </LoadingButton>
            </Stack>
          </Box>
          <Table sx={{mt:'10px'}}>
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
                              mr:'4px'
                            }}
                            variant="contained"
                            onClick={() => {
                              // Set the selected audio data for editing
                              setNewAudio({
                                language: audio.language,
                                audio: audio.audio,
                                duration: audio.duration,
                              });
                              setValue('audio', audio.audio);
                              setValue('duration', audio.duration);
                              setValue('language', audio.language);
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

StoryQuestionsQuickEditForm.propTypes = {
  currentQuestionId: PropTypes.number,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  onRefreshGeneralQuestions: PropTypes.func,
  languages: PropTypes.array
};
