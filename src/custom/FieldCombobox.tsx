import { IdType } from "@etsoo/shared";
import React from "react";
import { ComboBoxMultiple } from "../ComboBoxMultiple";
import { ICustomFieldReact } from "@etsoo/react";
import Typography from "@mui/material/Typography";

/**
 * Combobox (multiple values) field creator
 * type combobox
 * @returns Component
 */
export const FieldCombobox: ICustomFieldReact<IdType[]> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // State
  const [ids, setIds] = React.useState<IdType[]>();

  const getValue = () => ids;
  const setValue = (value: unknown) => {
    if (Array.isArray(value)) setIds(value);
    else if (typeof value === "number" || typeof value === "string")
      setIds([value]);
  };

  // Ref
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
      <Typography>No name for FieldCombobox {JSON.stringify(field)}</Typography>
    );
  }

  return (
    <ComboBoxMultiple
      label={field.label ?? ""}
      inputHelperText={field.helperText}
      name={name}
      options={field.options}
      fullWidth
      idValues={ids}
      onChange={(_event, value) => {
        const ids = value.map((v) => v.id);
        setIds(ids);
        onChange(name, ids);
      }}
      {...field.mainSlotProps}
    />
  );
};
