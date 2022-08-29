import { NumberUtils } from '@etsoo/shared';
import { Typography } from '@mui/material';
import React from 'react';
import { NumberTextProps } from './NumberText';

/**
 * Money text props
 */
export interface MoneyTextProps extends NumberTextProps {
    /**
     * Currency, USD for US dollar
     */
    currency?: string;

    /**
     * Is integer number
     */
    isInteger?: boolean;
}

/**
 * Money text
 * @param props Props
 * @returns Component
 */
export function MoneyText(props: MoneyTextProps) {
    // Destruct
    const {
        currency,
        isInteger = false,
        locale,
        options = {},
        value,
        ...rest
    } = props;

    // Layout
    return (
        <Typography component="span" fontSize="inherit" {...rest}>
            {NumberUtils.formatMoney(
                value,
                currency,
                locale,
                isInteger,
                options
            )}
        </Typography>
    );
}
