import { useDelayedExecutor } from "@etsoo/react";
import React from "react";
import { MUGlobal } from "./MUGlobal";
import TextField, { TextFieldProps } from "@mui/material/TextField";

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
    onChange,
    readOnly,
    size = MUGlobal.searchFieldSize,
    variant = MUGlobal.searchFieldVariant,
    minChars = 0,
    slotProps,
    ...rest
  } = props;

  const { input, inputLabel, htmlInput, ...restSlotProps } = slotProps ?? {};

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
      onChange={onChangeEx}
      size={size}
      variant={variant}
      slotProps={{
        input: { readOnly, ...input },
        inputLabel: { shrink: MUGlobal.searchFieldShrink, ...inputLabel },
        htmlInput: { ["data-min-chars"]: minChars, ...htmlInput },
        ...restSlotProps
      }}
      {...rest}
    />
  );
}
