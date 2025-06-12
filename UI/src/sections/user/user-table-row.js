import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
// import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onRefreshUsers, onSessionIconClick }) {
  const navigate = useNavigate();
  const { firstName, lastName, avatar, email, permissions, isActive, phoneNumber } = row;

  const name = `${firstName || ''} ${lastName || ''}`

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  let role = '';

  if (permissions?.includes('listener')) {
    role = 'Listener'
  } else {
    role = 'Admin'
  }

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <Avatar alt={name} src={avatar?.fileUrl} sx={{ mr: 2 }} />

          <ListItemText
            primary={name}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{phoneNumber}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email || 'Not Available'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{role}</TableCell>


        <TableCell>
          <Label
            variant="soft"
            color={
              (isActive ? 'success' : 'error')
            }
          >
            {isActive ? 'Active' : 'Banned'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Last Login Sessions" placement="top" arrow>
            <IconButton color="primary" onClick={onSessionIconClick}>
              <Iconify icon="mdi:clock" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Analytics" placement="top" arrow>
            <IconButton
              color="default"
              onClick={() => {
                navigate(paths.dashboard.user.analytics(row.id));
              }}
            >
              <Iconify icon="eva:bar-chart-fill" />
            </IconButton>
          </Tooltip>
          

          {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} onRefreshUsers={onRefreshUsers} />

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

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onRefreshUsers: PropTypes.func,
  onSessionIconClick: PropTypes.func
};
