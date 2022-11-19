import {
    Button,
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import StartIcon from '@mui/icons-material/Start';
import { InputDialogProps } from '@etsoo/react';
import React from 'react';
import { globalApp } from './app/ReactApp';
import { MUGlobal } from './MUGlobal';
import { HBox } from './FlexBox';

/**
 * Data step
 */
export type DataStep = Omit<InputDialogProps, 'callback'> & {
    /**
     * Callback
     */
    callback: (form: HTMLFormElement) => boolean | void;
};

/**
 * Data collecting steps component props
 */
export type DataStepsProps<T extends object> = Omit<
    TextFieldProps,
    'InputProps' | 'onClick'
> & {
    /**
     * JSON value
     */
    jsonValue: T;

    /**
     * Value formatter
     */
    valueFormatter?: (data: T) => string;

    /**
     * Steps
     */
    steps: (index: number, data: T) => [DataStep, boolean];

    /**
     * On value change handler
     */
    onValueChange?: (value: T) => void;
};

/**
 * Data collecting steps component
 * @param props Props
 * @returns Component
 */
export function DataSteps<T extends object>(props: DataStepsProps<T>) {
    // App
    const app = globalApp;

    // Labels
    const labels = app.getLabels('close', 'nextStep', 'previousStep', 'submit');

    // Destruct
    const {
        InputLabelProps = {},
        jsonValue,
        valueFormatter = (_data: T) => '...',
        onValueChange,
        steps,
        value = '',
        ...rest
    } = props;

    // Shrink
    InputLabelProps.shrink ??= MUGlobal.searchFieldShrink;

    // Current index
    const indexRef = React.useRef<number>(-1);

    // Current value
    const [localValue, setLocalValue] = React.useState(value);

    // Get step
    const showStep = (index: number) => {
        indexRef.current = index;
        const [{ callback, ...rest }, more] = steps(index, jsonValue);

        app.showInputDialog({
            ...rest,
            buttons: (n, callback) => (
                <HBox
                    paddingLeft={2}
                    paddingRight={2}
                    paddingBottom={2}
                    gap={2}
                    justifyContent="space-between"
                >
                    {index === 0 ? (
                        <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={() => n.dismiss()}
                        >
                            {labels.close}
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            startIcon={<NavigateBeforeIcon />}
                            onClick={() => {
                                n.dismiss();
                                showStep(indexRef.current - 1);
                            }}
                        >
                            {labels.previousStep}
                        </Button>
                    )}

                    {more ? (
                        <Button
                            variant="contained"
                            startIcon={<NavigateNextIcon />}
                            onClick={async (event) => {
                                const result = await callback(event);
                                if (!result) return;
                                showStep(indexRef.current + 1);
                            }}
                        >
                            {labels.nextStep}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={<CheckIcon />}
                            onClick={async (event) => {
                                const result = await callback(event);
                                if (!result) return;

                                setLocalValue(valueFormatter(jsonValue));

                                if (onValueChange) onValueChange(jsonValue);
                            }}
                        >
                            {labels.submit}
                        </Button>
                    )}
                </HBox>
            ),
            callback: (form) => {
                if (form == null) return;
                const result = callback(form);
                if (result !== true) {
                    return false;
                }
            }
        });
    };

    const cancelInput = (event: React.SyntheticEvent) => {
        event.stopPropagation();
        event.preventDefault();
    };

    React.useEffect(() => {
        setLocalValue(valueFormatter(jsonValue));
    }, [jsonValue]);

    return (
        <TextField
            InputLabelProps={InputLabelProps}
            inputProps={{ style: { cursor: 'pointer' } }}
            InputProps={{
                onKeyDown: (event) => {
                    if (event.key === 'Tab') return;
                    cancelInput(event);
                },
                onPaste: cancelInput,
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton edge="end" size="small">
                            <StartIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            onClick={() => showStep(0)}
            value={localValue}
            {...rest}
        />
    );
}
