import { ICustomFieldReact } from "@etsoo/react";
import React from "react";
import { InputField } from "../InputField";
import Typography from "@mui/material/Typography";

/**
 * Textarea field creator
 * type: textarea
 * @returns Component
 */
export const FieldTexarea: ICustomFieldReact<string> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // Ref
  const inputRef = React.useRef<HTMLInputElement>();

  const getValue = () => inputRef.current?.value;

  const setValue = (value: unknown) => {
    if (inputRef.current) inputRef.current.value = `${value ?? ""}`;
  };

  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  // Name
  const name = field.name;
  if (!name) {
    return (
      <Typography>No name for FieldTextarea {JSON.stringify(field)}</Typography>
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
      defaultValue={defaultValue}
      onChange={() => onChange(name, getValue())}
      {...field.mainSlotProps}
    />
  );
};
