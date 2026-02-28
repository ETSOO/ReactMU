import { useCombinedRefs } from "@etsoo/react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { MUGlobal } from "./MUGlobal";
import { useRequiredAppContext } from "./app/ReactApp";

/**
 * JSON text field props
 */
export type JsonTextFieldProps = TextFieldProps & {
  /**
   * Whether the value is an array
   */
  isArray?: boolean;

  /**
   * Edit button click handler
   */
  onEdit?: (input: HTMLInputElement) => void;
};

/**
 * JSON text field component
 * @param props Props
 * @returns Component
 */
export function JsonTextField(props: JsonTextFieldProps) {
  // Destruct
  const {
    fullWidth = true,
    inputRef,
    isArray = false,
    multiline = true,
    onChange,
    onEdit,
    rows = 3,
    slotProps,
    ...rest
  } = props;

  // Slot props
  const { input, inputLabel, ...restSlotProps } = slotProps ?? {};

  const localRef = React.useRef<HTMLInputElement>(null);

  // Global app
  const app = useRequiredAppContext();

  return (
    <TextField
      fullWidth={fullWidth}
      inputRef={useCombinedRefs(inputRef, localRef)}
      multiline={multiline}
      onChange={(event) => {
        const value = event.target.value.trim();
        let errorMessage = "";

        if (value.length > 0) {
          try {
            const parsed = JSON.parse(value);
            if (isArray && !Array.isArray(parsed)) {
              errorMessage =
                app.get("jsonDataArrayError") || "Value must be a JSON array";
            }

            if (typeof parsed !== "object") {
              throw new Error("Parsed value is not an object");
            }
          } catch (e) {
            errorMessage =
              (app.get("jsonDataError") || "Invalid JSON text") + " - " + e;
          }
        }

        event.target.setCustomValidity(errorMessage);
        event.target.reportValidity();

        onChange?.(event);
      }}
      rows={rows}
      slotProps={{
        input: {
          endAdornment: onEdit ? (
            <InputAdornment position="end">
              <IconButton onClick={() => onEdit?.(localRef.current!)}>
                <EditIcon />
              </IconButton>
            </InputAdornment>
          ) : undefined,
          ...input
        },
        inputLabel: {
          shrink: MUGlobal.inputFieldShrink,
          ...inputLabel
        },
        ...restSlotProps
      }}
      {...rest}
    />
  );
}
