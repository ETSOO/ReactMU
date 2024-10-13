import { Breakpoint } from "@mui/material";

/**
 * Responsive style value
 */
export type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | {
      [key in Breakpoint]?: T | null;
    };
