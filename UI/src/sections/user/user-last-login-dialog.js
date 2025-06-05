/* eslint-disable no-nested-ternary */
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import PropTypes from 'prop-types';

export default function LastLoginDialog({ open, onClose, sessions }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Last Login Sessions</DialogTitle>

            <DialogContent>
                {sessions?.length === 0 ? (
                    <Typography>No login sessions found.</Typography>
                ) : (
                    <List>
                        {sessions && sessions.length > 0 ? sessions.map((session, index) => (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <>
                                                {session.ip_address && `IP: ${session.ip_address}`}
                                                {session.ip_address && session.device_info && ' | '}
                                                {session.device_info && `Device: ${session.device_info}`}
                                            </>
                                        }
                                        secondary={
                                            session.createdAt
                                                ? `Logged In At: ${new Date(session.createdAt).toLocaleString()}`
                                                : null
                                        }
                                    />
                                </ListItem>
                                {index < sessions.length - 1 && <Divider />}
                            </React.Fragment>
                        )) : (
                            <Typography variant='h6'>No Sessions found</Typography>
                        )}
                    </List>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

LastLoginDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    sessions: PropTypes.array.isRequired,
};
