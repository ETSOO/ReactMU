import { ICustomFieldReact } from "@etsoo/react";
import { Typography } from "@mui/material";
import React from "react";
import { InputField } from "../InputField";

function parseJson(value: string | undefined | null) {
  if (value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Textarea field creator
 * type: json
 * @returns Component
 */
export const FieldJson: ICustomFieldReact<object> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // Ref
  const inputRef = React.useRef<HTMLInputElement>();

  const getValue = () => parseJson(inputRef.current?.value);

  const setValue = (value: unknown) => {
    if (inputRef.current) {
      const obj =
        typeof value === "object"
          ? value
          : typeof value === "string"
          ? parseJson(value)
          : undefined;
      inputRef.current.value = obj ? JSON.stringify(obj, null, 4) : "";
    }
  };

  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  React.useEffect(() => {
    if (defaultValue == null) return;
    setValue(defaultValue);
  }, [defaultValue]);

  // Name
  const name = field.name;
  if (!name) {
    return (
      <Typography>No name for FieldJson {JSON.stringify(field)}</Typography>
    );
  }

  return (
    <InputField
      label={field.label ?? ""}
      helperText={field.helperText}
      name={name}
      fullWidth
      multiline
      rows={4}
      inputProps={{ maxLength: 1280 }}
      inputRef={inputRef}
      onChange={() => onChange(name, getValue())}
      {...field.mainSlotProps}
    />
  );
};
