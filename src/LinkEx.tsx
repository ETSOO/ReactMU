import { Link, LinkProps } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router";

/**
 * Extended link component props
 */
export type LinkExProps = Omit<LinkProps<typeof RouterLink>, "component"> & {
  /**
   * Disabled or not
   */
  disabled?: boolean;
};

/**
 * Extended link component
 * @param props Props
 * @returns Component
 */
export function LinkEx(props: LinkExProps) {
  const { children, disabled, underline = "hover", ...rest } = props;
  return disabled ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <Link component={RouterLink} underline={underline} {...rest}>
      {children}
    </Link>
  );
}
