import { CustomFieldData, CustomFieldSpace } from "@etsoo/appscript";
import { DataTypes, DateUtils, NumberUtils } from "@etsoo/shared";
import { Divider } from "@mui/material";
import {
  ViewContainer,
  ViewContainerProps,
  ViewPageFieldType,
  ViewPageRowType
} from "../ViewContainer";
import { useRequiredAppContext } from "../app/ReactApp";

/**
 * Custom field view UI Props
 */
export type CustomFieldViewUIProps<T extends DataTypes.StringRecord> = Omit<
  ViewContainerProps<T>,
  "fields"
> & {
  /**
   * Custom fields
   */
  fields: CustomFieldData[];
};

/**
 * Transform custom field space
 * @param space Space
 * @returns Result
 */
function transformSize(space?: CustomFieldSpace): ViewPageRowType | undefined {
  if (space == null) return undefined;

  switch (space) {
    case "full":
      return true;
    case "quater":
      return "medium";
    case "five":
      return { xs: 12, sm: 12, md: 5, lg: 4, xl: 3 };
    case "seven":
      return { xs: 12, sm: 12, md: 7, lg: 6, xl: 5 };
    default:
      return false;
  }
}

/**
 * Custom field view UI
 * @param props Props
 * @returns Component
 */
export function CustomFieldViewUI<T extends DataTypes.StringRecord>(
  props: CustomFieldViewUIProps<T>
) {
  // Destruct
  const { fields, ...rest } = props;

  // App
  const app = useRequiredAppContext();

  // Mapping
  const mappedFields = fields.map((f) => {
    const type = f.type;
    const label = f.label ? (app.get(f.label) ?? f.label) : undefined;
    const singleRow = transformSize(f.space);
    const name = f.name ?? "";
    let item: ViewPageFieldType<T>;
    switch (type) {
      case "amountlabel":
        const currency = f.mainSlotProps?.currency;
        const symbol = currency ? NumberUtils.getCurrencySymbol(currency) : "";
        item = {
          label: "",
          singleRow,
          data: label
            ? () => `${symbol}${app.formatNumber(parseFloat(label))}`
            : () => ""
        };
        break;
      case "checkbox":
      case "combobox":
      case "radio":
      case "select":
        item = {
          label,
          singleRow,
          data: (data) => {
            const value = data[name];
            if (value == null) return undefined;

            const values = Array.isArray(value) ? value : [value];
            const options = f.options ?? [];
            const selectedOptions = options.filter((o) =>
              values.includes(o.id)
            );
            return selectedOptions
              .map((o) => {
                const label = DataTypes.getListItemLabel(o);
                return app.get(label) ?? label;
              })
              .join(", ");
          }
        };
        break;
      case "date":
        item = {
          label,
          singleRow,
          data: (data) => {
            const value = data[name];
            if (value == null) return undefined;

            return typeof value === "string"
              ? (DateUtils.parse(value)?.toLocaleDateString() ?? value)
              : value instanceof Date
                ? value.toLocaleDateString()
                : `${value}`;
          }
        };
        break;
      case "divider":
        item = {
          label,
          singleRow,
          data: () => <Divider />
        };
        break;
      case "json":
        item = {
          label,
          singleRow,
          data: (data) => {
            const value = data[name];
            if (value == null) return undefined;
            return JSON.stringify(value, null, 2);
          }
        };
        break;
      case "number":
        const numberCurrency = f.mainSlotProps?.currency;
        const numberSymbol = numberCurrency
          ? NumberUtils.getCurrencySymbol(numberCurrency)
          : "";
        item = {
          label: numberCurrency ? `${label} (${numberCurrency})` : label,
          singleRow,
          data: (data) => {
            const value = NumberUtils.parse(data[name]);
            return value == null
              ? undefined
              : `${numberSymbol}${app.formatNumber(value)}`;
          }
        };
        break;
      default:
        item = { label, singleRow, data: name };
    }

    return item;
  });

  return <ViewContainer fields={mappedFields} {...rest} />;
}
