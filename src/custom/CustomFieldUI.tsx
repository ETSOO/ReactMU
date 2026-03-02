import { CustomFieldData } from "@etsoo/appscript";
import React from "react";
import { CustomFieldUtils } from "./CustomFieldUtils";

/**
 * CustomFieldUI component props
 */
export type CustomFieldUIProps<D extends CustomFieldData = CustomFieldData> = {
  /**
   * Custom fields
   */
  fields: D[];

  /**
   * Change event
   * @param data Current data collection
   * @param name Changed field name
   * @param value Changed field value
   */
  onChange?: (
    data: Record<string, unknown>,
    name: string,
    value: unknown
  ) => void;

  /**
   * Initial value
   */
  value?: Record<string, unknown>;
};

/**
 * CustomFieldUI component
 * @param props Props
 * @returns component
 */
export function CustomFieldUI<D extends CustomFieldData = CustomFieldData>(
  props: CustomFieldUIProps<D>
) {
  // Destruct
  const { fields, onChange, value } = props;

  const data = React.useRef<Record<string, unknown>>({});

  const getValue = React.useCallback(
    (field: CustomFieldData) => {
      if (!field.name) return undefined;
      return value?.[field.name];
    },
    [value]
  );

  const doChange = React.useCallback((name: string, value: unknown) => {
    data.current[name] = value;
    onChange?.(data.current, name, value);
  }, []);

  // Layout
  return CustomFieldUtils.create(fields, {}, getValue, doChange);
}
