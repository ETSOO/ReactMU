import { TextField, TextFieldProps } from "@mui/material";
import React from "react";
import { MUGlobal } from "./MUGlobal";

type ReactIMask = typeof import("react-imask", { with: { "resolution-mode": "import" }}).useIMask;
type RIOpts = Parameters<ReactIMask>[0];
type RIReturns = ReturnType<ReactIMask>;
type RIMaskRef = RIReturns["maskRef"]["current"];
type RIMValue = RIReturns["value"];

// Currently CommonJS modules are not supported by "react-imask" package
let useIMask: ReactIMask;
import("react-imask").then((module) => useIMask = module.useIMask);

/**
 * Mask input props
 */
export type MaskInputProps = TextFieldProps & {
  /**
   * Mask props
   */
  mask: RIOpts;

  /**
   * Accept hanlder
   */
  onAccept?: (value: RIMValue, maskRef: RIMaskRef, e?: InputEvent) => void;

  /**
   * Complete handler
   */
  onComplete?: (value: RIMValue, maskRef: RIMaskRef, e?: InputEvent) => void;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Search case
   */
  search?: boolean;
};

/**
 * Mask input
 * https://imask.js.org/
 * @param props Props
 * @returns Component
 */
export function MaskInput(
  props: MaskInputProps
) {
  // Destruct
  const {
    defaultValue,
    mask,
    onAccept,
    onComplete,
    readOnly,
    search = false,
    size = search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize,
    slotProps,
    value,
    variant = search ? MUGlobal.searchFieldVariant : MUGlobal.inputFieldVariant,
    ...rest
  } = props;

  const { ref, maskRef } = useIMask(mask, {
    onAccept: (value: RIMValue, maskRef: RIMaskRef, event?: InputEvent) => {
      if (onAccept) onAccept(value, maskRef, event);
    },
    onComplete: (value: RIMValue, maskRef: RIMaskRef, event?: InputEvent) => {
      if (onComplete) onComplete(value, maskRef, event);
    }
  });

  const localValue = defaultValue ?? value;

  React.useEffect(() => {
    if (maskRef.current == null || localValue == null) return;
    maskRef.current.value = String(localValue);
    maskRef.current.updateValue();
  }, [maskRef.current, localValue]);

  // Layout
  return (
    <TextField
      slotProps={{
         htmlInput: { readOnly, ...slotProps?.htmlInput },
         inputLabel: { shrink: search ? MUGlobal.searchFieldShrink : MUGlobal.inputFieldShrink, ...slotProps?.inputLabel }
      }}
      size={size}
      variant={variant}
      inputRef={ref}
      {...rest}
    />
  );
}