import { Stack, Typography } from '@mui/material';
import Switch, { SwitchProps } from '@mui/material/Switch';
import React from 'react';

/**
 * Ant style switch props
 */
export interface SwitchAntProps extends SwitchProps {
    /**
     * Active color
     */
    activeColor?: string;

    /**
     * Start label
     */
    startLabel: string;

    /**
     * End label
     */
    endLabel: string;
}

/**
 * Ant style switch
 * @param props Props
 * @returns Component
 */
export function SwitchAnt(props: SwitchAntProps) {
    // Destruct
    const {
        activeColor,
        checked,
        defaultChecked,
        defaultValue,
        endLabel,
        startLabel,
        onChange,
        value = 'true',
        ...rest
    } = props;

    // Checked state
    const [controlChecked, setControlChecked] = React.useState(
        checked ?? defaultChecked ?? defaultValue == value
    );

    // Ref
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (checked) setControlChecked(checked);
    }, [checked]);

    // On change
    const onChangeLocal = (
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        if (onChange) onChange(event, checked);
        setControlChecked(checked);
    };

    // Layout
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography
                onClick={() => controlChecked && ref.current?.click()}
                sx={{
                    cursor: 'pointer',
                    color: controlChecked
                        ? undefined
                        : (theme) => activeColor ?? theme.palette.warning.main
                }}
            >
                {startLabel}
            </Typography>
            <Switch
                checked={controlChecked}
                inputRef={ref}
                value={value}
                onChange={onChangeLocal}
                {...rest}
            />
            <Typography
                onClick={() => !controlChecked && ref.current?.click()}
                sx={{
                    cursor: 'pointer',
                    color: controlChecked
                        ? (theme) => activeColor ?? theme.palette.warning.main
                        : undefined
                }}
            >
                {endLabel}
            </Typography>
        </Stack>
    );
}
