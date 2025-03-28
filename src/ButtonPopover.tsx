import Popover, { PopoverOrigin } from "@mui/material/Popover";
import React from "react";

/**
 * Button popover props
 */
export type ButtonPopoverProps<T> = {
  /**
   * Button component
   * @param callback Button click callback
   * @returns Layout
   */
  button: (callback: (handler: HTMLElement | null) => void) => React.ReactNode;

  /**
   * Children component
   * @param data Data
   * @returns Layout
   */
  children: (data: T | null) => React.ReactNode;

  /**
   * Load data
   * @returns Data promise
   */
  loadData?: () => Promise<T | undefined>;

  /**
   * Position
   */
  position?: PopoverOrigin["horizontal"];
};

/**
 * Button popover component
 * @param props Props
 * @returns Component
 */
export function ButtonPopover<T>(props: ButtonPopoverProps<T>) {
  // Destruct
  const { button, children, loadData, position = "right" } = props;

  // States
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [data, setData] = React.useState<T | null>(null);
  const isLoadded = React.useRef(false);

  const open = Boolean(anchorEl);

  // Load data
  React.useEffect(() => {
    if (loadData && (!isLoadded.current || open)) {
      // First time or when open
      loadData().then((d) => {
        if (d == null) return;
        setData(d);
        isLoadded.current = true;
      });
    }
  }, [loadData, open]);

  // Children
  const currentChildren = React.useMemo(() => children(data), [children, data]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const styles = position === "left" ? { left: 14 } : { right: 14 };

  // Layout
  return (
    <React.Fragment>
      {button((handler) => setAnchorEl(handler))}
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: position, vertical: "top" }}
        anchorOrigin={{ horizontal: position, vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1,
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                ...styles
              }
            }
          }
        }}
      >
        {currentChildren}
      </Popover>
    </React.Fragment>
  );
}
