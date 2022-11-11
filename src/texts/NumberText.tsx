import { NumberUtils } from '@etsoo/shared';
import { Typography, TypographyProps } from '@mui/material';
import React from 'react';

/**
 * Number text props
 */
export interface NumberTextProps extends TypographyProps {
    /**
     * Locale
     */
    locale?: string | string[];

    /**
     * Options
     */
    options?: Intl.NumberFormatOptions;

    /**
     * Value
     */
    value?: number | bigint | null;
}

/**
 * Number text
 * @param props Props
 * @returns Component
 */
export function NumberText(props: NumberTextProps) {
    // Destruct
    const { locale, options = {}, value, ...rest } = props;

    // Layout
    return (
        <Typography component="span" fontSize="inherit" {...rest}>
            {value == null ? '' : NumberUtils.format(value, locale, options)}
        </Typography>
    );
}
