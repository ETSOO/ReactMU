import { ICustomFieldReact } from "@etsoo/react";
import { NumberUtils } from "@etsoo/shared";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import React from "react";

/**
 * Amount label field creator
 * type: amountlabel
 * @returns Component
 */
export const FieldAmountLabel: ICustomFieldReact<string> = ({
  field,
  mref,
  defaultValue
}) => {
  // Destruct
  const { label, mainSlotProps = {}, helperText } = field;
  const { currency, ...rest } = mainSlotProps;

  const currencySymbol = React.useMemo(
    () => (currency ? NumberUtils.getCurrencySymbol(currency) : ""),
    [currency]
  );

  // State
  const [amountLabel, setAmountLabel] = React.useState<string | undefined>(
    label
  );

  React.useEffect(() => {
    setAmountLabel(label);
  }, [label]);

  // Ref
  const getValue = () => amountLabel;
  const setValue = (value: unknown) => {
    if (typeof value === "number") {
      setAmountLabel(NumberUtils.formatMoney(value));
    } else {
      setAmountLabel(`${value} ?? ''`);
    }
  };

  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  React.useEffect(() => {
    if (defaultValue == null) return;
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <React.Fragment>
      <Typography {...rest}>
        {currencySymbol} {amountLabel}
      </Typography>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </React.Fragment>
  );
};
