import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

/**
 * Countdown button action
 */
export interface CountdownButtonAction {
  (): Promise<number>;
}

/**
 * Countdown button props
 */
export type CountdownButtonProps = Omit<ButtonProps, "endIcon" | "disabled"> & {
  /**
   * Initial state, default 0
   */
  initState?: number;

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
export function CountdownButton(props: CountdownButtonProps) {
  // Destructure
  const { initState = 0, onAction, onClick, ...rest } = props;

  // State
  // 0 - normal
  // 1 - loading
  // >= 2 - countdown seconds
  const [state, updateState] = React.useState(0);

  // Ignore seconds
  const ignoreSeconds = 2;

  // Refs
  const refs = React.useRef({ isMounted: false, maxLength: 0 });

  // Set state
  const setState = React.useCallback((result: number) => {
    // Seconds to wait, 120
    if (result > ignoreSeconds) {
      // Here 122
      result += ignoreSeconds;
      updateState(result);

      // Update max length
      refs.current.maxLength = result.toString().length;

      const seed = setInterval(() => {
        // Mounted?
        if (!refs.current.isMounted) return;

        // Last 1 second and then complete
        if (result > ignoreSeconds + 1) {
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
  }, []);

  // endIcon
  let endIcon: React.ReactNode;
  if (state === 0) {
    endIcon = undefined;
  } else if (state === 1) {
    endIcon = <CircularProgress size={12} />;
  } else {
    const countdown = (state - ignoreSeconds)
      .toString()
      .padStart(refs.current.maxLength, "0");
    endIcon = <span style={{ fontSize: "smaller" }}>{countdown}</span>;
  }

  // Disabled?
  const disabled = state > 0;

  // Local click
  const localClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Show loading
    updateState(1);

    // Callback
    if (onClick != null) onClick(event);

    // Return any countdown
    onAction().then(setState);
  };

  React.useEffect(() => {
    refs.current.isMounted = true;
    return () => {
      refs.current.isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    setState(initState);
  }, [initState]);

  return (
    <Button
      disabled={disabled}
      endIcon={endIcon}
      onClick={localClick}
      {...rest}
    />
  );
}
