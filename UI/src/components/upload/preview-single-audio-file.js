/* eslint-disable consistent-return */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// MUI Box and other components
import Box from '@mui/material/Box';

export default function SingleAudioFilePreview({ audioUrl = '' }) {
  const [duration, setDuration] = useState(null); // To store duration
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration); // Update the duration state
      }
    };

    if (audio) {
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: '100%',
        height: 'auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="audio"
        controls
        ref={audioRef}
        src={audioUrl}
        preload="auto" // Only load metadata initially
        sx={{
          width: '100%',
          outline: 'none',
        }}
        aria-label="Audio file player"
      >
        <track
          src="/audios/captions.vtt"
          kind="captions"
          srcLang="en"
          label="English"
        />
        Your browser does not support the audio element.
      </Box>
      <p>{duration}</p>
    </Box>
  );
}

SingleAudioFilePreview.propTypes = {
  audioUrl: PropTypes.string,
};
