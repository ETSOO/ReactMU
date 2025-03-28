import { PopoverProps } from "@mui/material/Popover";

/**
 * Notifier Popup pros
 */
export type NotifierPopupProps = Omit<PopoverProps, "open" | "onClose">;
