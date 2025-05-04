import Button, { ButtonProps } from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

/**
 * ButtonLink props
 */
export type ButtonLinkProps<T = unknown> = Omit<
  ButtonProps,
  "href" | "onClick"
> & {
  /**
   * To href
   */
  href: string;

  /**
   * Link state
   */
  state?: T;
};

/**
 * ButtonLink
 * @param props Props
 * @returns Component
 */
export function ButtonLink<T = unknown>(props: ButtonLinkProps<T>) {
  // Destruct
  const { href, state, ...rest } = props;

  // Navigate
  const navigate = useNavigate();

  const onClick = href.includes("://")
    ? () => window.open(href, "_blank")
    : () => navigate(href, { state });

  // Layout
  return <Button {...rest} onClick={onClick} />;
}
