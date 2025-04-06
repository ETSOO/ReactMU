import { Link, LinkProps } from "@mui/material";
import { Link as RouterLink } from "react-router";

/**
 * Extended link component props
 */
export type LinkExProps = Omit<LinkProps<typeof RouterLink>, "component">;

/**
 * Extended link component
 * @param props Props
 * @returns Component
 */
export function LinkEx(props: LinkExProps) {
  const { underline = "hover", ...rest } = props;
  return <Link component={RouterLink} underline={underline} {...rest} />;
}
