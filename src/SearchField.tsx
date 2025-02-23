import { useDelayedExecutor } from "@etsoo/react";
import { TextField, TextFieldProps } from "@mui/material";
import React from "react";
import { MUGlobal } from "./MUGlobal";

/**
 * Search field props
 */
export type SearchFieldProps = TextFieldProps & {
  /**
   * Change delay (ms) to avoid repeatly dispatch onChange
   */
  changeDelay?: number;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Minimum characters to trigger the change event
   */
  minChars?: number;
};

/**
 * Search field
 * @param props Props
 * @returns Component
 */
export function SearchField(props: SearchFieldProps) {
  // Destruct
  const {
    changeDelay,
    InputLabelProps = {},
    InputProps = {},
    inputProps = {},
    onChange,
    readOnly,
    size = MUGlobal.searchFieldSize,
    variant = MUGlobal.searchFieldVariant,
    minChars = 0,
    ...rest
  } = props;

  // Shrink
  InputLabelProps.shrink ??= MUGlobal.searchFieldShrink;

  // Read only
  if (readOnly != null) InputProps.readOnly = readOnly;

  // Min characters
  inputProps["data-min-chars"] = minChars;

  const isMounted = React.useRef(true);
  const delayed =
    onChange != null && changeDelay != null && changeDelay >= 1
      ? useDelayedExecutor(onChange, changeDelay)
      : undefined;

  const onChangeEx = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Min characters check
    const len = event.target.value.length;
    if (len > 0 && len < minChars) {
      // Avoid to trigger the form change event
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    if (onChange == null) return;

    if (changeDelay == null || changeDelay < 1) {
      onChange(event);
      return;
    }

    delayed?.call(undefined, event);
  };

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      delayed?.clear();
    };
  }, []);

  // Layout
  return (
    <TextField
      InputLabelProps={InputLabelProps}
      InputProps={InputProps}
      inputProps={inputProps}
      onChange={onChangeEx}
      size={size}
      variant={variant}
      {...rest}
    />
  );
}
