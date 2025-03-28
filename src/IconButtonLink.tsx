import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { useNavigate } from "react-router";

/**
 * IconButtonLink props
 */
export type IconButtonLinkProps = Omit<IconButtonProps, "href" | "onClick"> & {
  /**
   * To href
   */
  href: string;

  /**
   * Link state
   */
  state?: any;
};

/**
 * IconButtonLink
 * @param props Props
 * @returns Component
 */
export function IconButtonLink(props: IconButtonLinkProps) {
  // Destruct
  const { href, state, ...rest } = props;

  // Navigate
  const navigate = useNavigate();

  // Layout
  return <IconButton {...rest} onClick={() => navigate(href, { state })} />;
}
