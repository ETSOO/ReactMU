import React from "react";
import { FormControlLabel, FormControlLabelProps } from "@mui/material";
import MuiCheckbox from "@mui/material/Checkbox";
import MuiSwitch from "@mui/material/Switch";

/**
 * Switch props
 */
export interface SwitchProps extends Omit<FormControlLabelProps, "control"> {
  /**
   * Value, default 'on'
   */
  value?: string;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Size
   */
  size?: "small" | "medium";

  /**
   * Display as Checkbox
   */
  checkbox?: boolean;
}

/**
 * Switch
 * @param props Props
 * @returns Component
 */
export function Switch(props: SwitchProps) {
  // Destruct
  const {
    checked,
    defaultChecked,
    defaultValue,
    onChange,
    readOnly,
    size,
    checkbox = false,
    value = "true",
    ...rest
  } = props;

  // Checked state
  const [controlChecked, setControlChecked] = React.useState(
    checked ?? defaultChecked ?? defaultValue == value
  );

  React.useEffect(() => {
    if (checked) setControlChecked(checked);
  }, [checked]);

  // Handle change
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (onChange) onChange(event, checked);
    setControlChecked(checked);
  };

  // Control
  const control = checkbox ? (
    <MuiCheckbox
      readOnly={readOnly}
      checked={controlChecked}
      onChange={handleChange}
      size={size}
      value={value}
    />
  ) : (
    <MuiSwitch
      readOnly={readOnly}
      checked={controlChecked}
      onChange={handleChange}
      size={size}
      value={value}
    />
  );

  // Default state
  React.useEffect(() => {
    setControlChecked(controlChecked);
  }, [controlChecked]);

  // Layout
  return <FormControlLabel control={control} {...rest} />;
}
