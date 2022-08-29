import { IconButton, IconButtonProps } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * IconButtonLink props
 */
export type IconButtonLinkProps = Omit<IconButtonProps, 'href' | 'onClick'> & {
    /**
     * To href
     */
    href: string;
};

/**
 * IconButtonLink
 * @param props Props
 * @returns Component
 */
export function IconButtonLink(props: IconButtonLinkProps) {
    // Destruct
    const { href, ...rest } = props;

    // Navigate
    const navigate = useNavigate();

    // Layout
    return <IconButton {...rest} onClick={() => navigate(href)} />;
}
