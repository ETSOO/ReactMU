import {
  Box,
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel
} from "@mui/material";
import NotchedOutline from "@mui/material/OutlinedInput";
import React from "react";
import { SwitchAnt } from "./SwitchAnt";

/**
 * SwitchField props
 */
export type SwitchFieldProps = Omit<
  FormControlProps<"fieldset">,
  "defaultValue"
> & {
  /**
   * Helper text
   */
  helperText?: React.ReactNode;

  /**
   * Label
   */
  label?: string;

  /**
   * Checked
   */
  checked?: boolean;

  /**
   * Active color
   */
  activeColor?: string;

  /**
   * Start label
   */
  startLabel?: string;

  /**
   * End label
   */
  endLabel?: string;

  /**
   * Height in px
   */
  height?: number;

  /**
   * Value, default is true
   */
  value?: unknown;
};

/**
 * SwitchField
 * @param props Props
 * @returns Component
 */
export function SwitchField(props: SwitchFieldProps) {
  // Destruct
  const {
    activeColor,
    startLabel,
    endLabel,
    value = true,

    fullWidth,
    height = 56,
    helperText,
    label,
    name,
    required,
    sx = {},
    checked,
    variant = "outlined",
    ...rest
  } = props;

  // Outlined
  const outlined = variant === "outlined";

  if (sx) {
    Object.assign(sx, { height: outlined ? `${height}px` : undefined });
  }

  // Layout
  return (
    <React.Fragment>
      <FormControl component="fieldset" fullWidth={fullWidth} sx={sx} {...rest}>
        {label && (
          <InputLabel required={required} variant={variant} shrink>
            {label}
          </InputLabel>
        )}
        {outlined && (
          <NotchedOutline
            label={label && required ? label + " *" : label}
            notched
            sx={{
              cursor: "default",
              position: "absolute",
              width: fullWidth ? "100%" : "auto",
              "& input": {
                visibility: "hidden"
              }
            }}
          />
        )}
        <Box
          paddingLeft={2}
          paddingY="7px"
          position={outlined ? "absolute" : undefined}
        >
          <SwitchAnt
            activeColor={activeColor}
            name={name}
            startLabel={startLabel}
            endLabel={endLabel}
            value={value}
            checked={checked}
          />
        </Box>
      </FormControl>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </React.Fragment>
  );
}
