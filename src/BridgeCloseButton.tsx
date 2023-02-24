import { BridgeUtils, IBridgeHost } from "@etsoo/appscript";
import CloseIcon from "@mui/icons-material/Close";
import { Box, BoxProps, IconButton, IconButtonProps } from "@mui/material";
import React from "react";
import { globalApp } from "./app/ReactApp";

/**
 * Bridge close button props
 */
export interface BridgeCloseButtonProps extends IconButtonProps {
  /**
   * Box props
   */
  boxProps?: BoxProps;

  /**
   * Validate the host
   * @param host Host
   */
  validate?(host: IBridgeHost): boolean;
}

/**
 * Bridge close button
 * @param props Props
 * @returns Component
 */
export function BridgeCloseButton(props: BridgeCloseButtonProps) {
  // Destruct
  const {
    boxProps,
    onClick,
    title = globalApp?.get("close") ?? "Close",
    validate,
    ...rest
  } = props;

  // Host
  const host = BridgeUtils.host;

  if (
    host == null ||
    !host.closable() ||
    (validate && validate(host) === false)
  ) {
    return <React.Fragment />;
  }

  // Click handler
  const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(event);
    host.exit();
  };

  return (
    <Box {...boxProps}>
      <IconButton
        aria-label="close"
        onClick={onClickLocal}
        title={title}
        {...rest}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
