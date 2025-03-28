import React from "react";
import { MUGlobal } from "./MUGlobal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ClearIcon from "@mui/icons-material/Clear";
import { Keyboard } from "@etsoo/shared";
import { ReactUtils, useCombinedRefs, useDelayedExecutor } from "@etsoo/react";
import { useAppContext } from "./app/ReactApp";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

/**
 * Extended text field props
 */
export type TextFieldExProps = TextFieldProps & {
  /**
   * Change delay (ms) to avoid repeatly dispatch onChange
   */
  changeDelay?: number;

  /**
   * Clear button label
   */
  clearLabel?: string;

  /**
   * Click clear button callback
   */
  onClear?: (doClear: () => void) => void;

  /**
   * On enter click
   */
  onEnter?: React.KeyboardEventHandler<HTMLDivElement>;

  /**
   * On visibility
   * @param input HTML input
   * @returns Result
   */
  onVisibility?: (input: HTMLInputElement) => void | boolean | Promise<boolean>;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Show clear button
   */
  showClear?: boolean;

  /**
   * Show password button
   */
  showPassword?: boolean;
};

/**
 * Extended text field methods
 */
export interface TextFieldExMethods {
  /**
   * Set error
   * @param error Error
   */
  setError(error: React.ReactNode): void;
}

export const TextFieldEx = React.forwardRef<
  TextFieldExMethods,
  TextFieldExProps
>((props, ref) => {
  // Global app
  const app = useAppContext();

  // Labels
  const { showIt, clearInput } = app?.getLabels("showIt", "clearInput") ?? {};

  // Destructure
  const {
    changeDelay,
    clearLabel = clearInput,
    error,
    fullWidth = true,
    helperText,
    InputLabelProps = {},
    InputProps = {},
    onChange,
    onClear,
    onKeyDown,
    onEnter,
    onVisibility,
    inputRef,
    readOnly,
    showClear,
    showPassword,
    type,
    variant = MUGlobal.textFieldVariant,
    ...rest
  } = props;

  // Shrink
  InputLabelProps.shrink ??= MUGlobal.searchFieldShrink;

  // State
  const [errorText, updateErrorText] = React.useState<React.ReactNode>();
  const [empty, updateEmpty] = React.useState<boolean>(true);

  // Read only
  if (readOnly != null) InputProps.readOnly = readOnly;

  // Calculate
  let errorEx = error;
  let helperTextEx = helperText;
  if (errorText != null) {
    errorEx = true;
    helperTextEx = errorText;
  }

  let typeEx = showPassword ? "password" : type;

  let input: HTMLInputElement | undefined;
  const localRef = (ref: HTMLInputElement) => {
    input = ref;

    if (input.value !== "") {
      updateEmpty(false);
    }
  };

  const doClear = () => {
    if (input == null) return;
    ReactUtils.triggerChange(input, "", false);
    input.focus();
  };

  const clearClick = () => {
    if (onClear) {
      onClear(doClear);
    } else {
      doClear();
    }
  };

  const preventDefault = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent long press
    if (e.isPropagationStopped()) e.stopPropagation();

    if (e.isDefaultPrevented()) e.preventDefault();
  };

  const touchStart = async (e: React.TouchEvent | React.MouseEvent) => {
    // Show the password
    if (input) {
      if (onVisibility) {
        const result = await onVisibility(input);
        if (result === false) return;
      }

      input.blur();
      input.type = "text";
    }
    preventDefault(e);
  };

  const touchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    // Show the password
    if (input) {
      if (onVisibility) return;

      input.type = "password";
    }
    preventDefault(e);
  };

  // Show password and/or clear button
  if (!empty && (showPassword || showClear)) {
    InputProps.endAdornment = (
      <InputAdornment position="end">
        {showPassword && (
          <IconButton
            tabIndex={-1}
            onContextMenu={(event) => event.preventDefault()}
            onMouseDown={touchStart}
            onMouseUp={touchEnd}
            onTouchStart={touchStart}
            onTouchCancel={touchEnd}
            onTouchEnd={touchEnd}
            title={showIt}
          >
            <VisibilityIcon />
          </IconButton>
        )}
        {showClear && (
          <IconButton onClick={clearClick} tabIndex={-1} title={clearLabel}>
            <ClearIcon />
          </IconButton>
        )}
      </InputAdornment>
    );
  }

  // Extend key precess
  const onKeyPressEx =
    onEnter == null
      ? onKeyDown
      : (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === Keyboard.Keys.Enter) {
            // Enter press callback
            onEnter(e);
          }

          if (!e.isDefaultPrevented && onKeyDown != null) {
            // Common press callback
            onKeyDown(e);
          }
        };

  React.useImperativeHandle(
    ref,
    () => ({
      /**
       * Set error
       * @param error Error
       */
      setError(error: React.ReactNode): void {
        updateErrorText(error);
      }
    }),
    []
  );

  const isMounted = React.useRef(true);
  const delayed =
    onChange != null && changeDelay != null && changeDelay >= 1
      ? useDelayedExecutor(onChange, changeDelay)
      : undefined;

  const onChangeEx = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (errorText != null) {
      // Reset
      updateErrorText(undefined);
    }

    if (showClear || showPassword) {
      if (event.target.value === "") {
        updateEmpty(true);
      } else if (empty) {
        updateEmpty(false);
      }
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

  // Textfield
  return (
    <TextField
      error={errorEx}
      fullWidth={fullWidth}
      helperText={helperTextEx}
      inputRef={useCombinedRefs(inputRef, localRef)}
      InputProps={InputProps}
      InputLabelProps={InputLabelProps}
      onChange={onChangeEx}
      onKeyDown={onKeyPressEx}
      type={typeEx}
      variant={variant}
      {...rest}
    />
  );
});
