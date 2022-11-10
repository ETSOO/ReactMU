import { Input, InputAdornment } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useDimensions } from '@etsoo/react';
import React from 'react';
import { DateUtils, DomUtils } from '@etsoo/shared';
import { InputField, InputFieldProps } from './InputField';

type ValueType = string | number | Date | null | undefined;

/**
 * TwoField Input props
 */
export type TwoFieldInputProps = Omit<
    InputFieldProps,
    'InputProps' | 'value'
> & {
    /**
     * Values
     */
    values?: unknown | [ValueType, ValueType];

    /**
     * On values change, return false to prevent further onChange handler
     */
    onValuesChange?: (
        values: [ValueType, ValueType]
    ) => boolean | void | Promise<boolean | void>;
};

/**
 * TwoField Input
 * @param props Props
 * @returns Component
 */
export function TwoFieldInput(props: TwoFieldInputProps) {
    // Destruct
    const {
        name,
        inputProps,
        type = inputProps?.inputMode,
        values,
        onValuesChange,
        onChange,
        onInput,
        ...rest
    } = props;

    // Local values
    const localValues: [ValueType, ValueType] =
        values == null
            ? [null, null]
            : Array.isArray(values)
            ? (values as [ValueType, ValueType])
            : [values as ValueType, null];

    // Ref
    const valueRef = React.useRef<[ValueType, ValueType]>(localValues);

    // Watch container
    const { dimensions } = useDimensions(
        1,
        (target, rect) => {
            const width = (rect.width - 64) / 2;
            const inputs = target.querySelectorAll('input');
            inputs[0].style.width = `${width}px`;
            inputs[1].parentElement!.style.width = `${width}px`;
        },
        0
    );

    // Handle change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = DomUtils.getInputValue(event.target);
        const index = event.target.name.endsWith('-start') ? 0 : 1;
        valueRef.current[index] = value;

        if (onValuesChange) {
            if (onValuesChange(valueRef.current) === false) return;
        }
        if (onChange) onChange(event);
    };

    const formatValue = (v: ValueType, type?: string) => {
        if (v == null) return '';
        if (typeof v === 'number') return v;
        if (type === 'date' || type === 'datetime-local')
            return DateUtils.formatForInput(v, type);
        return v;
    };

    React.useEffect(() => {
        valueRef.current = localValues;
    }, [localValues]);

    // Layout
    return (
        <InputField
            name={`${name}-start`}
            type={type}
            value={formatValue(localValues[0], type)}
            ref={dimensions[0][0]}
            inputProps={inputProps}
            InputProps={{
                endAdornment: (
                    <InputAdornment
                        position="end"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <ArrowRightAltIcon />
                        <Input
                            type={type}
                            name={`${name}-end`}
                            value={formatValue(localValues[1], type)}
                            disableUnderline
                            onInput={onInput}
                            onChange={handleChange}
                            inputProps={inputProps}
                        />
                    </InputAdornment>
                )
            }}
            onInput={onInput}
            onChange={handleChange}
            {...rest}
        />
    );
}
