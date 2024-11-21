import { useDelayedExecutor } from "@etsoo/react";
import { ClickAwayListener, Tooltip, TooltipProps } from "@mui/material";
import React from "react";

/**
 * Tooltip with click visibility props
 */
export interface TooltipClickProps
  extends Omit<
    TooltipProps,
    "children" | "open" | "disableFocusListener" | "disableTouchListener"
  > {
  children: (
    openTooltip: (newTitle?: string) => void
  ) => React.ReactElement<any, any>;

  disableHoverListener?: boolean;
}

/**
 * Tooltip with click visibility
 * @param props Props
 * @returns Component
 */
export function TooltipClick(props: TooltipClickProps) {
  // Destruct
  // leaveDelay set to 5 seconds to hide the tooltip automatically
  const {
    children,
    disableHoverListener = true,
    leaveDelay = 5000,
    onClose,
    title,
    ...rest
  } = props;

  // State
  const [localTitle, setTitle] = React.useState(title);
  const [open, setOpen] = React.useState(false);

  const delayed =
    leaveDelay > 0
      ? useDelayedExecutor(() => setOpen(false), leaveDelay)
      : undefined;

  // Callback for open the tooltip
  const openTooltip = (newTitle?: string) => {
    setOpen(true);
    if (newTitle) setTitle(newTitle);
    delayed?.call();
  };

  React.useEffect(() => {
    return () => {
      delayed?.clear();
    };
  }, []);

  // Layout
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        PopperProps={{
          disablePortal: true
        }}
        onClose={(event) => {
          setOpen(false);
          if (onClose) onClose(event);
        }}
        title={localTitle}
        open={open}
        disableFocusListener
        disableTouchListener
        disableHoverListener={disableHoverListener}
        onMouseOver={disableHoverListener ? undefined : () => setOpen(true)}
        {...rest}
      >
        {children(openTooltip)}
      </Tooltip>
    </ClickAwayListener>
  );
}
