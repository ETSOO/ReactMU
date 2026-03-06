import { CustomFieldData, CustomFieldRef } from "@etsoo/appscript";
import { CustomFieldReactCollection } from "@etsoo/react";
import React from "react";
import { CustomFieldUtils } from "./CustomFieldUtils";
import { useAppContext } from "../app/ReactApp";

/**
 * CustomFieldUI component props
 */
export type CustomFieldUIProps<D extends CustomFieldData = CustomFieldData> = {
  /**
   * Custom fields
   */
  fields: D[];

  /**
   * Initial value
   */
  initialValue?: Record<string, unknown>;

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
   * Methods reference
   */
  mref: React.Ref<CustomFieldRef<Record<string, unknown>>>;
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
  const { fields, initialValue, mref, onChange } = props;

  // App
  const app = useAppContext();

  // Field component collections
  const collections: CustomFieldReactCollection<D> = {};

  // Value reference
  const valueRef = React.useRef<Record<string, unknown>>({ ...initialValue });

  // Methods
  React.useImperativeHandle(
    mref,
    () => ({
      getValue: () => valueRef.current,
      setValue: (value) => {
        if (!!value && typeof value === "object") {
          valueRef.current = { ...value };
          CustomFieldUtils.updateValues(collections, valueRef.current);
        }
      }
    }),
    []
  );

  // Layout
  return CustomFieldUtils.create(
    fields,
    collections,
    (field) => {
      if (!field.name) return undefined;
      return valueRef.current[field.name];
    },
    (name, fieldValue) => {
      valueRef.current[name] = fieldValue;
      onChange?.(valueRef.current, name, fieldValue);
    },
    (input) => app?.get(input) ?? input
  );
}
