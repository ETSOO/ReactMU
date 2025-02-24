import { Breakpoint, useMediaQuery, useTheme } from "@mui/material";

/**
 * Hook to get the current breakpoint
 * @returns The current breakpoint
 */
export function useCurrentBreakpoint(): Breakpoint {
  const theme = useTheme();
  const items: (Breakpoint | null)[] = [
    useMediaQuery(theme.breakpoints.down("xs")) ? "xs" : null,
    useMediaQuery(theme.breakpoints.between("xs", "sm")) ? "sm" : null,
    useMediaQuery(theme.breakpoints.between("sm", "md")) ? "md" : null,
    useMediaQuery(theme.breakpoints.between("md", "lg")) ? "lg" : null,
    useMediaQuery(theme.breakpoints.up("lg")) ? "xl" : null
  ];
  return items.find((item) => item != null) ?? "lg";
}
