import { NumberUtils } from "@etsoo/shared";
import { NumberTextProps } from "./NumberText";
import Typography from "@mui/material/Typography";

/**
 * Money text props
 */
export interface MoneyTextProps extends NumberTextProps {
  /**
   * Currency, USD for US dollar
   */
  currency?: string;

  /**
   * Is integer number
   */
  isInteger?: boolean;
}

/**
 * Money text
 * @param props Props
 * @returns Component
 */
export function MoneyText(props: MoneyTextProps) {
  // Destruct
  const {
    currency,
    isInteger = false,
    locale,
    options = {},
    value,
    ...rest
  } = props;

  // Layout
  return (
    <Typography component="span" fontSize="inherit" {...rest}>
      {value == null
        ? ""
        : NumberUtils.formatMoney(value, currency, locale, isInteger, options)}
    </Typography>
  );
}
