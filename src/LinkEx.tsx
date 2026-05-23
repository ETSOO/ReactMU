import { Link, LinkProps, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

/**
 * Extended link component props
 */
export type LinkExProps = Omit<LinkProps<typeof RouterLink>, "component"> & {
  /**
   * Disabled or not
   */
  disabled?: boolean;

  /**
   * Plain text class name
   */
  textClassName?: string;
};

/**
 * Extended link component
 * @param props Props
 * @returns Component
 */
export function LinkEx(props: LinkExProps) {
  const {
    children,
    color,
    disabled,
    textClassName,
    underline = "hover",
    variant,
    ...rest
  } = props;
  return disabled ? (
    <Typography color={color} variant={variant} className={textClassName}>
      {children}
    </Typography>
  ) : (
    <Link
      color={color}
      component={RouterLink}
      underline={underline}
      variant={variant}
      {...rest}
    >
      {children}
    </Link>
  );
}
