import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';

/**
 * Countdown button action
 */
export interface CountdownButtonAction {
    (): Promise<number>;
}

/**
 * Countdown button props
 */
export type CountdownButtonProps = Omit<ButtonProps, 'endIcon' | 'disabled'> & {
    /**
     * Action, required
     */
    onAction: CountdownButtonAction;
};

/**
 * Countdown button
 * @param props Props
 * @returns Button
 */
export const CountdownButton = React.forwardRef<
    HTMLButtonElement,
    CountdownButtonProps
>((props, ref) => {
    // Destructure
    const { onAction, onClick, ...rest } = props;

    // State
    // 0 - normal
    // 1 - loading
    // 2 - countdown
    const [state, updateState] = React.useState(0);

    // Ignore seconds
    const seconds = 2;

    // Countdown length
    const [shared] = React.useState({ maxLength: 0 });

    const isMounted = React.useRef(true);

    // endIcon
    let endIcon: React.ReactNode;
    if (state === 0) {
        endIcon = undefined;
    } else if (state === 1) {
        endIcon = <CircularProgress size={12} />;
    } else {
        const countdown = (state - seconds)
            .toString()
            .padStart(shared.maxLength, '0');
        endIcon = <span style={{ fontSize: 'smaller' }}>{countdown}</span>;
    }

    // Disabled?
    const disabled = state > 0;

    // Action
    const doAction = (result: number) => {
        // Seconds to wait, 120
        if (result > seconds) {
            // Here 122
            result += seconds;
            updateState(result);

            // Update max length
            shared.maxLength = result.toString().length;

            const seed = setInterval(() => {
                // Mounted?
                if (!isMounted.current) return;

                // Last 1 second and then complete
                if (result > seconds + 1) {
                    result--;
                    updateState(result);
                } else {
                    clearInterval(seed);
                    updateState(0);
                }
            }, 1000);
        } else {
            updateState(0);
        }
    };

    // Local click
    const localClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Show loading
        updateState(1);

        // Callback
        if (onClick != null) onClick(event);

        // Return any countdown
        onAction().then(doAction);
    };

    React.useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    return (
        <Button
            disabled={disabled}
            endIcon={endIcon}
            onClick={localClick}
            ref={ref}
            {...rest}
        />
    );
});
