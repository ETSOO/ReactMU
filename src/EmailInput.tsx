import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';

/**
 * Email input props
 */
export type EmailInputProps = Omit<TextFieldProps, 'type'> & {};

/**
 * Email input
 * @param props Props
 */
export function EmailInput(props: EmailInputProps) {
    // Destruct
    const { inputProps = {}, ...rest } = props;

    // Default max length
    inputProps.maxLength ??= 128;

    // Layout
    return (
        <TextField type="email" fullWidth inputProps={inputProps} {...rest} />
    );
}
