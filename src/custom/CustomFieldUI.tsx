import { CustomFieldData } from "@etsoo/appscript";
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
  const { fields, onChange, value = {} } = props;

  // Layout
  return CustomFieldUtils.create(
    fields,
    {},
    (field) => {
      if (!field.name) return undefined;
      return value[field.name];
    },
    (name, fieldValue) => {
      value[name] = fieldValue;
      onChange?.(value, name, fieldValue);
    }
  );
}
