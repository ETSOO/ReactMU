import { Paper, PaperProps } from '@mui/material';
import React from 'react';
import Draggable from 'react-draggable';

/**
 * Draggable paper component
 * @param props Props
 * @returns Component
 */
export function DraggablePaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle=".draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}
