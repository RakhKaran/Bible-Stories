/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
// import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Stack } from '@mui/material';
// import CategoryQuickEditForm from './push-notification-quick-edit-form';

export default function PushNotificationTableRow({ row, selected, onEditRow, onDeleteRow, onRefreshPushNotification }) {
  const { title, image, messageBody, notificationData, createdAt } = row;

  const confirm = useBoolean();
  // const quickEdit = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={title}
            src={image?.fileUrl || ''}
            variant="rounded"
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <ListItemText
            disableTypography
            primary={
              <Typography noWrap color="inherit" variant="subtitle2" sx={{ cursor: 'pointer' }}>
                {title}
              </Typography>
            }
            secondary={
              <Typography noWrap variant="caption" color="text.secondary">
                {messageBody}
              </Typography>
            }
          />
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

        <TableCell>
          <Stack spacing={1} mt={1}>
            <Label variant="soft" color="success">
              Sent: {notificationData?.sentCount || 0}
            </Label>
            <Label variant="soft" color="error">
              Failed: {notificationData?.failedCount || 0}
            </Label>
          </Stack>
        </TableCell> 

         {/* <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </TableCell> */}
      </TableRow>

      {/* <CategoryQuickEditForm
        currentCategory={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onRefreshPushNotification={onRefreshPushNotification}
      /> */}

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
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

PushNotificationTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onRefreshPushNotification: PropTypes.func,
};
