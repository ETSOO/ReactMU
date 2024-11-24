import { Button, ButtonProps } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
/**
 * ButtonLink props
 */
export type ButtonLinkProps = Omit<ButtonProps, "href" | "onClick"> & {
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
 * ButtonLink
 * @param props Props
 * @returns Component
 */
export function ButtonLink(props: ButtonLinkProps) {
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
