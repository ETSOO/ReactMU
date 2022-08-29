import {
    Button,
    ButtonProps,
    CircularProgress,
    CircularProgressProps
} from '@mui/material';
import React from 'react';

/**
 * Loading button props
 */
export type LoadingButtonProps = ButtonProps & {
    /**
     * Loading icon props
     */
    loadingIconProps?: CircularProgressProps;
};

/**
 * Loading button
 * @param props Props
 */
export function LoadingButton(props: LoadingButtonProps) {
    // Destruct
    const { endIcon, loadingIconProps = {}, onClick, ...rest } = props;

    // Default size
    loadingIconProps.size ??= 12;

    // State
    // https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
    const [loading, setLoading] = React.useState(false);

    // Icon
    const localEndIcon = loading ? (
        <CircularProgress {...loadingIconProps} />
    ) : (
        endIcon
    );

    // Check if the component is mounted
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Layout
    return (
        <Button
            disabled={loading}
            endIcon={localEndIcon}
            onClick={async (event) => {
                if (onClick) {
                    // Update state
                    setLoading(true);

                    // https://stackoverflow.com/questions/38508420/how-to-know-if-a-function-is-async
                    // const AsyncFunction = (async () => {}).constructor;
                    // onClick instanceof AsyncFunction
                    await onClick(event);

                    // Warning: Can't perform a React state update on an unmounted component
                    // It's necessary to check the component is mounted now
                    if (isMounted.current) {
                        setLoading(false);
                    }
                }
            }}
            {...rest}
        />
    );
}
