import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// assets
import { UploadIllustration } from 'src/assets/illustrations';
//
import Iconify from '../iconify';
//
import RejectionFiles from './errors-rejection-files';
import SingleAudioFilePreview from './preview-single-audio-file';

// ----------------------------------------------------------------------

export default function UploadAudio({
  disabled,
  multiple = false,
  error,
  helperText,
  //
  file,
  onDelete,
  //
  files,
  onUpload,
  onRemove,
  onRemoveAll,
  sx,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    accept: 'audio/*',
    ...other,
  });

  const audioRef = useRef(null);

  console.log('fileData', file);

  const hasFile = !!file && !multiple;

  console.log('has file', hasFile);

  const hasFiles = !!files && multiple && !!files.length;

  const hasError = isDragReject || !!error;

  const renderPlaceholder = (
    <Stack spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap">
      <UploadIllustration sx={{ width: 1, maxWidth: 200 }} />
      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Drop or Select audio file</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Drop files here or click
          <Box
            component="span"
            sx={{
              mx: 0.5,
              color: 'primary.main',
              textDecoration: 'underline',
            }}
          >
            browse
          </Box>
          through your machine
        </Typography>
      </Stack>
    </Stack>
  );

  const renderSingleAudioPreview = hasFile && (
    <SingleAudioFilePreview audioUrl={typeof file === 'string' ? file : file.fileUrl} />
  );

  const removeSinglePreview = hasFile && onDelete && (
    <IconButton
      size="small"
      onClick={onDelete}
      sx={{
        top: 16,
        right: 16,
        zIndex: 9,
        position: 'absolute',
        color: (theme) => alpha(theme.palette.common.white, 0.8),
        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
        },
      }}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );

  const renderMultiAudioPreview = hasFiles && (
    <>
      <Box sx={{ my: 3 }}>
        {files.map((audioFile, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <audio
                controls
                src={audioFile?.fileUrl}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
                >
                <track
                    src="captions.vtt"
                    kind="captions"
                    srcLang="en"
                    label="English"
                />
                Your browser does not support the audio element.
            </audio>
            {onRemove && (
              <Button
                color="inherit"
                size="small"
                onClick={() => onRemove(audioFile)}
                sx={{ mt: 1 }}
              >
                Remove
              </Button>
            )}
          </Box>
        ))}
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        {onRemoveAll && (
          <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
            Remove All
          </Button>
        )}

        {onUpload && (
          <Button
            size="small"
            variant="contained"
            onClick={onUpload}
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          >
            Upload
          </Button>
        )}
      </Stack>
    </>
  );

  return (
    <Box sx={{ width: 1, position: 'relative', ...sx }}>
      <Box
        {...getRootProps()}
        sx={{
          p: 5,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
          '&:hover': {
            opacity: 0.72,
          },
          ...(isDragActive && {
            opacity: 0.72,
          }),
          ...(disabled && {
            opacity: 0.48,
            pointerEvents: 'none',
          }),
          ...(hasError && {
            color: 'error.main',
            bgcolor: 'error.lighter',
            borderColor: 'error.light',
          }),
          ...(hasFile && {
            padding: '24% 0',
          }),
        }}
      >
        <input {...getInputProps()} />

        {hasFile ? renderSingleAudioPreview : renderPlaceholder}
      </Box>

      {removeSinglePreview}

      {helperText && helperText}

      <RejectionFiles fileRejections={fileRejections} />

      {renderMultiAudioPreview}
    </Box>
  );
}

UploadAudio.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  files: PropTypes.array,
  helperText: PropTypes.object,
  multiple: PropTypes.bool,
  onDelete: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  sx: PropTypes.object,
};
