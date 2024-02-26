import { TextField, TextFieldProps } from "@mui/material";
import React from "react";
import { MUGlobal } from "./MUGlobal";
import { type InputMask, type FactoryOpts } from "imask";
import { useIMask } from "react-imask";

/**
 * Mask input props
 */
export type MaskInputProps<T extends FactoryOpts> = TextFieldProps & {
  /**
   * Mask props
   */
  mask: T;

  /**
   * Accept hanlder
   */
  onAccept?: (value: unknown, maskRef: InputMask<T>, e?: InputEvent) => void;

  /**
   * Complete handler
   */
  onComplete?: (value: unknown, maskRef: InputMask<T>, e?: InputEvent) => void;

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
export function MaskInput<T extends FactoryOpts = FactoryOpts>(
  props: MaskInputProps<T>
) {
  // Destruct
  const {
    defaultValue,
    mask,
    InputLabelProps = {},
    InputProps = {},
    onAccept,
    onComplete,
    readOnly,
    search = false,
    size = search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize,
    value,
    variant = search ? MUGlobal.searchFieldVariant : MUGlobal.inputFieldVariant,
    ...rest
  } = props;

  const { ref, maskRef } = useIMask(mask, {
    onAccept: (value, maskRef, event) => {
      if (onAccept) onAccept(value, maskRef, event);
    },
    onComplete: (value, maskRef, event) => {
      if (onComplete) onComplete(value, maskRef, event);
    }
  });
  const localValue = defaultValue ?? value;

  // Shrink
  InputLabelProps.shrink ??= search
    ? MUGlobal.searchFieldShrink
    : MUGlobal.inputFieldShrink;

  // Read only
  if (readOnly != null) InputProps.readOnly = readOnly;
  InputProps.inputRef = ref;

  React.useEffect(() => {
    if (maskRef.current == null || localValue == null) return;
    maskRef.current.value = String(localValue);
    maskRef.current.updateValue();
  }, [maskRef.current, localValue]);

  // Layout
  return (
    <TextField
      InputLabelProps={InputLabelProps}
      InputProps={InputProps}
      size={size}
      variant={variant}
      {...rest}
    />
  );
}
