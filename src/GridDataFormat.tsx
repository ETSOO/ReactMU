import { GridColumnRenderProps, GridDataType } from "@etsoo/react";
import { DateUtils, NumberUtils } from "@etsoo/shared";
import React from "react";
import { DateText } from "./texts/DateText";

/**
 * Grid data format
 * @param data Input data
 * @param type Data type
 * @param renderProps Render props
 * @returns Result
 */
export function GridDataFormat(
  data: unknown,
  type: GridDataType,
  renderProps?: GridColumnRenderProps
): React.ReactNode {
  // Null
  if (data == null) return undefined;

  // For date time
  // Conversion if necessary
  if (type === GridDataType.Date || type === GridDataType.DateTime) {
    const dateValue =
      data instanceof Date
        ? data
        : typeof data === "number" || typeof data === "string"
        ? new Date(data)
        : undefined;

    if (dateValue == null) return undefined;

    const option = type === GridDataType.DateTime ? "ds" : "d";

    const nearDays = renderProps?.nearDays;
    if (nearDays != null) {
      return (
        <DateText
          value={dateValue}
          locale={renderProps?.culture}
          timeZone={renderProps?.timeZone}
          options={option}
          nearDays={nearDays}
        />
      );
    }

    return DateUtils.format(
      dateValue,
      renderProps?.culture,
      option,
      renderProps?.timeZone
    );
  }

  // For numbers
  if (typeof data === "number") {
    if (type === GridDataType.Money || type === GridDataType.IntMoney)
      return NumberUtils.formatMoney(
        data,
        renderProps?.currency,
        renderProps?.culture,
        type === GridDataType.IntMoney,
        renderProps?.numberFormatOptions
      );
    else
      return NumberUtils.format(
        data,
        renderProps?.culture,
        renderProps?.numberFormatOptions
      );
  }

  if (typeof data === "string") return data;

  return `${data}`;
}
