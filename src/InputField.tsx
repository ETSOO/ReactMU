import { useDelayedExecutor } from '@etsoo/react';
import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';

/**
 * Input field props
 */
export type InputFieldProps = TextFieldProps & {
    /**
     * Change delay (ms) to avoid repeatly dispatch onChange
     */
    changeDelay?: number;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;
};

/**
 * Input field
 * @param props Props
 * @returns Component
 */
export const InputField = React.forwardRef<HTMLDivElement, InputFieldProps>(
    (props, ref) => {
        // Destruct
        const {
            changeDelay,
            InputLabelProps = {},
            InputProps = {},
            onChange,
            readOnly,
            size = MUGlobal.inputFieldSize,
            variant = MUGlobal.inputFieldVariant,
            ...rest
        } = props;

        // Shrink
        InputLabelProps.shrink ??= MUGlobal.searchFieldShrink;

        // Read only
        if (readOnly != null) InputProps.readOnly = readOnly;

        const isMounted = React.useRef(true);
        const delayed =
            onChange != null && changeDelay != null && changeDelay >= 1
                ? useDelayedExecutor(onChange, changeDelay)
                : undefined;

        const onChangeEx = (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (onChange == null) return;

            if (changeDelay == null || changeDelay < 1) {
                onChange(event);
                return;
            }

            delayed?.call(undefined, event);
        };

        React.useEffect(() => {
            return () => {
                isMounted.current = false;
                delayed?.clear();
            };
        }, []);

        // Layout
        return (
            <TextField
                ref={ref}
                InputLabelProps={InputLabelProps}
                InputProps={InputProps}
                onChange={onChangeEx}
                size={size}
                variant={variant}
                {...rest}
            />
        );
    }
);
