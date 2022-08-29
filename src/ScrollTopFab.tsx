import React from 'react';
import { Fab, useScrollTrigger, Zoom } from '@mui/material';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { CustomFabProps } from './CustomFabProps';

/**
 * Scroll to top fab
 * @returns Component
 */
export function ScrollTopFab(props: CustomFabProps) {
    // Destruct
    const { color, size, target, title } = props;

    // Scroll trigger
    const trigger = useScrollTrigger({
        target,
        disableHysteresis: true,
        threshold: 120
    });

    // Icon click handler
    // behavior: 'smooth'
    const handleClick = () => {
        target.scrollTo({ top: 0 });
    };

    return (
        <Zoom in={trigger}>
            <Fab color={color} size={size} title={title} onClick={handleClick}>
                <VerticalAlignTopIcon />
            </Fab>
        </Zoom>
    );
}
