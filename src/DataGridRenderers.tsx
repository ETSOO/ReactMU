import React from "react";
import { CircularProgress } from "@mui/material";
import { DateUtils, NumberUtils } from "@etsoo/shared";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGridExFooterItemRendererProps } from "./DataGridEx";
import { DateText } from "./texts/DateText";
import { GridCellRendererProps, GridDataType } from "@etsoo/react";

/**
 * Data grid renderers
 */
export namespace DataGridRenderers {
  /**
   * Default cell renderer
   * @param param Props
   * @returns Component
   */
  export function defaultCellRenderer<T extends Record<string, any>>({
    cellProps,
    data,
    field,
    formattedValue,
    columnIndex,
    type,
    renderProps
  }: GridCellRendererProps<T>): React.ReactNode {
    // Is loading
    if (data == null) {
      // First column, show loading indicator
      if (columnIndex === 0) return <CircularProgress size={15} />;

      // Others return undefined
      return undefined;
    }

    // No formatted value and data field
    if (formattedValue == null && field == null) return undefined;

    // Cell value
    const value = formattedValue ?? data[field!];
    if (value == null) return undefined;

    // For date time
    // Conversion if necessary
    if (type === GridDataType.Date || type === GridDataType.DateTime) {
      const dateValue = value instanceof Date ? value : new Date(value);

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
    if (typeof value === "number") {
      if (type === GridDataType.Money || type === GridDataType.IntMoney)
        return NumberUtils.formatMoney(
          value,
          renderProps?.currency,
          renderProps?.culture,
          type === GridDataType.IntMoney,
          renderProps?.numberFormatOptions
        );
      else
        return NumberUtils.format(
          value,
          renderProps?.culture,
          renderProps?.numberFormatOptions
        );
    }

    // For boolean
    if (typeof value === "boolean") {
      // Add style
      if ("align" in cellProps) {
        cellProps.sx = {
          paddingTop: "12px!important",
          paddingBottom: "6px!important"
        };
      } else {
        cellProps.sx = {
          paddingTop: "16px!important",
          paddingBottom: "8px!important"
        };
      }

      if (value) return <CheckIcon fontSize="small" />;
      else return <ClearIcon fontSize="small" color="warning" />;
    }

    // To string
    return new String(value);
  }

  /**
   * Default footer item renderer
   * @param rows Rows
   * @param props Renderer props
   * @param location Renderer location (column index)
   * @returns Component
   */
  export function defaultFooterItemRenderer<T extends object>(
    _rows: T[],
    { index, states, checkable }: DataGridExFooterItemRendererProps<T>,
    location: number = 0
  ) {
    const { selectedItems, loadedItems, hasNextPage } = states;

    if (index === location) {
      if (checkable) {
        return [
          selectedItems.length,
          loadedItems.toLocaleString() + (hasNextPage ? "+" : "")
        ].join(" / ");
      } else {
        return loadedItems.toLocaleString() + (hasNextPage ? "+" : "");
      }
    }

    return undefined;
  }
}
