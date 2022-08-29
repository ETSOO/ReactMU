import {
    Box,
    CircularProgress,
    LinearProgress,
    Typography
} from '@mui/material';
import React from 'react';

/**
 * Process count props
 */
export interface ProgressCountProps {
    /**
     * Is countdown or opposite
     * @default 'true'
     */
    countdown?: boolean;

    /**
     * Is linear or circular
     * @default 'true'
     */
    linear?: boolean;

    /**
     * Min width
     * @default 36
     */
    minWidth?: number;

    /**
     * On complete callback, return false will stop it
     */
    onComplete?: () => boolean;

    /**
     * On progress callback
     */
    onProgress?: (value: number) => void;

    /**
     * Seconds for count
     */
    seconds: number;

    /**
     * Value unit, like 's' or '%'
     * @default ''
     */
    valueUnit?: string;
}

/**
 * Progress count
 * @param props Props
 * @returns Component
 */
export function ProgressCount(props: ProgressCountProps) {
    // Destruct
    const {
        countdown = true,
        linear = true,
        minWidth = 36,
        onComplete,
        onProgress,
        seconds,
        valueUnit = ''
    } = props;

    // Progress value
    const [value, setValue] = React.useState(countdown ? seconds : 0);

    // Variant
    const [variant, setVariant] = React.useState<
        'determinate' | 'indeterminate'
    >('determinate');

    // Progress value
    const progressValue = (100.0 * value) / seconds;

    React.useEffect(() => {
        const timer = setInterval(() => {
            setValue((prev) => {
                const newValue = countdown
                    ? prev === 0
                        ? seconds
                        : prev - 1
                    : prev === seconds
                    ? 0
                    : prev + 1;

                if (countdown) {
                    if (newValue === 0) {
                        if (onComplete) {
                            const result = onComplete();
                            // Finish
                            if (result === false) {
                                clearInterval(timer);
                                setVariant('indeterminate');
                            }
                        }
                    }
                } else {
                    if (newValue === seconds) {
                        if (onComplete) {
                            const result = onComplete();
                            // Finish
                            if (result === false) {
                                clearInterval(timer);
                                setVariant('indeterminate');
                            }
                        }
                    }
                }

                if (onProgress) onProgress(newValue);

                return newValue;
            });
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    if (linear)
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant={variant} value={progressValue} />
                </Box>
                <Box sx={{ minWidth }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >{`${value}${valueUnit}`}</Typography>
                </Box>
            </Box>
        );

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant={variant} value={progressValue} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                >
                    {`${value}${valueUnit}`}
                </Typography>
            </Box>
        </Box>
    );
}
