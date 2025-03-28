import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useNavigate } from "react-router";

/**
 * BackButton props
 */
export interface BackButtonProps extends IconButtonProps {}

/**
 * BackButton
 * @param props Props
 * @returns Component
 */
export function BackButton(props: BackButtonProps) {
  // Destruct
  const { color = "primary", size = "small", onClick, ...rest } = props;

  // Theme
  const theme = useTheme();

  // Navigate
  const navigate = useNavigate();

  // Color
  const pColor =
    color != "inherit" && color != "default" && color in theme.palette
      ? theme.palette[color]
      : theme.palette.primary;

  // Click handler
  const onClickLocal = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(event);

    // Navigate
    navigate(-1);
  };

  return (
    <IconButton
      aria-label="Back"
      color={color}
      size={size}
      onClick={onClickLocal}
      sx={{
        backgroundColor: pColor.contrastText,
        border: `1px solid ${pColor.light}`
      }}
      {...rest}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}
