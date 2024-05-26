import React from "react";
import { CustomFieldUtils } from "./CustomFieldUtils";
import { ICustomFieldReact } from "@etsoo/react";

/**
 * Label field creator
 * type: label
 * @returns Component
 */
export const FieldLabel: ICustomFieldReact<string> = ({
  field,
  mref,
  defaultValue
}) => {
  // State
  const [label, setLabel] = React.useState<string>();

  // Ref
  const getValue = () => label;
  const setValue = (value: unknown) => setLabel(`${value ?? ""}`);
  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  React.useEffect(() => {
    setLabel(field.label);
  }, [field.label]);

  React.useEffect(() => {
    if (defaultValue == null) return;
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <React.Fragment>
      {CustomFieldUtils.createMultilineLabel(label, field.mainSlotProps)}
    </React.Fragment>
  );
};
