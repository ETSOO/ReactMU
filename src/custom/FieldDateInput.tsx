import { ICustomFieldReact } from "@etsoo/react";
import { DateUtils } from "@etsoo/shared";
import React from "react";
import { InputField } from "../InputField";
import Typography from "@mui/material/Typography";

/**
 * Date input field creator
 * type: date
 * @returns Component
 */
export const FieldDateInput: ICustomFieldReact<Date> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getValue = () =>
    inputRef.current == null
      ? undefined
      : DateUtils.parse(inputRef.current.value);

  const setValue = (value: unknown) => {
    if (inputRef.current == null) return;

    const date =
      value instanceof Date
        ? value
        : typeof value === "string"
        ? DateUtils.parse(value)
        : undefined;

    inputRef.current.value =
      DateUtils.formatForInput(
        date,
        inputRef.current.type === "date" ? undefined : false
      ) ?? "";
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
      <Typography>
        No name for FieldDateInput {JSON.stringify(field)}
      </Typography>
    );
  }

  return (
    <InputField
      label={field.label ?? ""}
      helperText={field.helperText}
      inputRef={inputRef}
      type="date"
      name={name}
      fullWidth
      onChange={() => onChange(name, getValue())}
      {...field.mainSlotProps}
    />
  );
};
