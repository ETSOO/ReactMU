import NotchedOutline from "@mui/material/OutlinedInput";
import React from "react";
import { SwitchAnt } from "./SwitchAnt";
import FormControl, { FormControlProps } from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";

/**
 * SwitchField props
 */
export type SwitchFieldProps = Omit<FormControlProps, "defaultValue"> & {
  /**
   * Helper text
   */
  helperText?: React.ReactNode;

  /**
   * Label
   */
  label?: string;

  /**
   * Field name
   */
  name: string;

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
    helperText,
    label,
    name,
    required,
    checked,
    variant = "outlined",
    ...rest
  } = props;

  // Outlined
  const outlined = variant === "outlined";

  // Group
  const group = (
    <SwitchAnt
      activeColor={activeColor}
      name={name}
      startLabel={startLabel}
      endLabel={endLabel}
      value={value}
      checked={checked}
    />
  );

  // Layout
  return (
    <React.Fragment>
      <FormControl fullWidth={fullWidth} {...rest}>
        {label && (
          <InputLabel required={required} variant={variant} shrink>
            {label}
          </InputLabel>
        )}
        {outlined ? (
          <NotchedOutline
            label={label && required ? label + " *" : label}
            notched
            endAdornment={group}
            sx={{
              cursor: "default",
              display: "flex",
              gap: 1,
              paddingX: 2,
              paddingY: "7px",
              width: fullWidth ? "100%" : "auto",
              "& input": {
                display: "none"
              }
            }}
          />
        ) : (
          <Box paddingLeft={2} paddingY="7px">
            {group}
          </Box>
        )}
      </FormControl>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </React.Fragment>
  );
}
