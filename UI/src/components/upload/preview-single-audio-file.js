/* eslint-disable consistent-return */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// MUI Box and other components
import Box from '@mui/material/Box';

export default function SingleAudioFilePreview({ audioUrl = '' }) {
  const [duration, setDuration] = useState(null); // To store duration
  const audioRef = useRef(null);

  useEffect(() => {
    // Handle metadata loading
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        // When metadata is loaded, update the duration
        // console.log('duration',audioRef.current.duration);
        setDuration(audioRef.current.duration);
      }
    };

    const audioElement = audioRef.current;

    if (audioElement) {
      // Add event listener for the loadedmetadata event
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        // Clean up the event listener
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
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
        preload="metadata" // Only load metadata initially
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
    </Box>
  );
}

SingleAudioFilePreview.propTypes = {
    audioUrl : PropTypes.string
}
