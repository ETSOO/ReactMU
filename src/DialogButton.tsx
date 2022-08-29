import {
    Breakpoint,
    Button,
    ButtonProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from '@mui/material';
import React from 'react';
import { Labels } from './app/Labels';

export interface DialogButtonProps extends ButtonProps {
    /**
     * Button label
     */
    buttonLabel?: string;

    /**
     * Dialog content
     */
    content: string;

    /**
     * Show content in pre component
     */
    contentPre?: boolean;

    /**
     * Default is label
     */
    dialogTitle?: string;

    /**
     * Disable the scroll lock behavior.
     * @default false
     */
    disableScrollLock?: boolean;

    /**
     * Show fullscreen dialog
     */
    fullScreen?: boolean;

    /**
     * If `true`, the dialog stretches to `maxWidth`.
     *
     * Notice that the dialog width grow is limited by the default margin.
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Other layouts
     */
    inputs?: React.ReactNode;

    /**
     * Max width of the dialog
     */
    maxWidth?: Breakpoint | false;

    /**
     * Icon button
     */
    icon?: React.ReactNode;
}

/**
 * Dialog button
 * @param props Props
 * @returns Component
 */
export function DialogButton(props: DialogButtonProps) {
    // Labels shared with NotificationMU
    const labels = Labels.NotificationMU;

    // Destruct
    const {
        buttonLabel = labels.alertOK,
        children,
        content,
        contentPre,
        dialogTitle,
        disableScrollLock,
        fullScreen,
        fullWidth,
        icon,
        inputs,
        maxWidth,
        onClick,
        title,
        ...rest
    } = props;

    // Open state
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    // Onclick handler
    const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Stop propagation
        event.stopPropagation();
        event.preventDefault();

        // Show dialog
        handleClickOpen();

        // Additional callback
        if (onClick) onClick(event);
    };

    // Layout
    return (
        <React.Fragment>
            {icon == null ? (
                <Button {...rest} title={title} onClick={onClickLocal}>
                    {children}
                </Button>
            ) : (
                <IconButton
                    {...rest}
                    onClick={onClickLocal}
                    title={title ?? children?.toString()}
                >
                    {icon}
                </IconButton>
            )}

            <Dialog
                disableScrollLock={disableScrollLock}
                fullScreen={fullScreen}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                open={open}
                onClose={() => setOpen(false)}
                onClick={(event) => {
                    // The dialog will be embeded and the click event will bubble up
                    // Stop propatation but will also cancel onClose and onBackdropClick event
                    event.stopPropagation();
                }}
            >
                <DialogTitle>{dialogTitle ?? title ?? children}</DialogTitle>
                <DialogContent>
                    <DialogContentText component={contentPre ? 'pre' : 'span'}>
                        {content}
                    </DialogContentText>
                    {inputs}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        {buttonLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
