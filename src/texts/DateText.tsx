import { DateUtils } from "@etsoo/shared";
import { Typography, TypographyProps } from "@mui/material";
import React from "react";

/**
 * Date text props
 */
export interface DateTextProps extends TypographyProps {
  /**
   * Locale
   */
  locale?: string;

  /**
   * Near days to show in error color
   */
  nearDays?: number;

  /**
   * Options
   */
  options?: DateUtils.FormatOptions;

  /**
   * Time zone
   */
  timeZone?: string;

  /**
   * Value to display
   */
  value?: Date | string;
}

/**
 * Date text
 * @param props Props
 * @returns Component
 */
export function DateText(props: DateTextProps) {
  // Destruct
  const {
    nearDays,
    locale = "lookup",
    options,
    timeZone,
    value,
    ...rest
  } = props;

  // Format date
  const date = DateUtils.parse(value);

  // Formatted value
  const localValue =
    date == null
      ? undefined
      : DateUtils.format(value, locale, options, timeZone);

  if (
    nearDays != null &&
    date != null &&
    Math.abs(new Date().substract(date).totalDays) <= nearDays
  ) {
    rest.color = "error";
  }

  // Layout
  return (
    <Typography component="span" fontSize="inherit" {...rest}>
      {localValue}
    </Typography>
  );
}
