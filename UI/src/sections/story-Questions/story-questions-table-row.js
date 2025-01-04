/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import StoryQuestionsQuickEditForm from './story-questions-quick-edit-form';

// ----------------------------------------------------------------------

export default function StoryQuestionsTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onRefreshStoriesQuestions,
  languagesData,
  activeAudioIndex,
  setActiveAudioIndex,
}) {
  const { question, audios, createdAt } = row;
  
  const audioRef = useRef([]); // Single reference array for all audio elements

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  // Handle audio play and pause logic
  const handleAudioPlay = (index) => {
    // Pause all other audios
    audioRef.current.forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
      }
    });
  
    // Update the active audio index
    setActiveAudioIndex(index);
  };

  // Effect to play the active audio when activeAudioIndex changes
  useEffect(() => {
    if (activeAudioIndex !== undefined && audioRef.current[activeAudioIndex]) {
      audioRef.current[activeAudioIndex].play();
    }
  }, [activeAudioIndex]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{question}</TableCell>
        <TableCell>
        <audio
            key={row.id}
            ref={(el) => {
              if (el && !audioRef.current.includes(el)) {
                audioRef.current[row.id] = el; // Append the reference to the array
              }
            }}
            controls
            onPlay={() => handleAudioPlay(row.id)} // Pass the index for play handling
            src={audios[0]?.audio?.fileUrl}
          />
        </TableCell>

        <TableCell>
          {audios[0]?.language?.nativeLangName}
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(createdAt), 'dd MMM yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <StoryQuestionsQuickEditForm
        currentQuestionId={row.id}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onRefreshStoriesQuestions={onRefreshStoriesQuestions}
        languages={languagesData}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

StoryQuestionsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onRefreshStoriesQuestions: PropTypes.func,
  activeAudioIndex: PropTypes.number, // Track the active audio index
  setActiveAudioIndex: PropTypes.func, // Function to update the active audio index
  languagesData: PropTypes.array,
};
