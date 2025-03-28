import FormControl, { FormControlProps } from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import NotchedOutline from "@mui/material/OutlinedInput";
import React from "react";

/**
 * FieldSetEx props
 */
export type FieldSetExProps = Omit<
  FormControlProps,
  "defaultValue" | "variant"
> & {
  /**
   * Label
   */
  label?: string;

  /**
   * Helper text
   */
  helperText?: React.ReactNode;
};

/**
 * FieldSetEx
 * @param props Props
 * @returns Component
 */
export function FieldSetEx(props: FieldSetExProps) {
  // Destruct
  const { label, helperText, required, fullWidth, children, ...rest } = props;

  // Layout
  return (
    <React.Fragment>
      <FormControl fullWidth={fullWidth} {...rest}>
        {label && (
          <InputLabel required={required} variant="outlined" shrink>
            {label}
          </InputLabel>
        )}
        <NotchedOutline
          label={label && required ? label + " *" : label}
          notched
          endAdornment={children}
          sx={{
            cursor: "default",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            paddingX: 2,
            paddingY: "7px",
            width: fullWidth ? "100%" : "auto",
            "& input": {
              display: "none"
            }
          }}
        />
      </FormControl>
      {helperText && (
        <FormHelperText sx={{ marginLeft: 2, marginRight: 2 }}>
          {helperText}
        </FormHelperText>
      )}
    </React.Fragment>
  );
}
