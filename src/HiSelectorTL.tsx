import { DataTypes, IdDefaultType } from "@etsoo/shared";
import {
  AutocompleteChangeReason,
  AutocompleteValue,
  FormLabel,
  Grid,
  RegularBreakpoints
} from "@mui/material";
import React from "react";
import { Tiplist } from "./Tiplist";

/**
 * Hierarchy tiplist selector props
 */
export type HiSelectorTLProps<
  T extends object,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
> = {
  /**
   * Break points
   */
  breakPoints?: RegularBreakpoints;

  /**
   * Id field
   */
  idField?: D;

  /**
   * Error
   */
  error?: boolean;

  /**
   * The helper text content.
   */
  helperText?: React.ReactNode;

  /**
   * Name, also hidden input field name
   */
  name: string;

  /**
   * Label
   */
  label?: string;

  /**
   * Load data callback
   */
  loadData: (
    keyword: string | undefined,
    id: T[D] | undefined,
    maxItems: number,
    parent?: T[D]
  ) => PromiseLike<T[] | null | undefined>;

  /**
   * On value change event
   */
  onChange?: (value: unknown) => void;

  /**
   * Item change callback
   */
  onItemChange?: (
    event: React.SyntheticEvent,
    option: T | null,
    reason: AutocompleteChangeReason
  ) => void;

  /**
   * Required
   */
  required?: boolean;

  /**
   * Search mode
   */
  search?: boolean;

  /**
   * Values
   */
  values?: T[D][];
};

/**
 * Hierarchy tiplist selector
 * @param props Prop
 * @returns Component
 */
export function HiSelectorTL<
  T extends object,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: HiSelectorTLProps<T, D>) {
  // Destruct
  const {
    breakPoints = { xs: 6, md: 4, lg: 3 },
    idField = "id" as D,
    error,
    helperText,
    name,
    label = name,
    loadData,
    onChange,
    onItemChange,
    required,
    search = false,
    values = []
  } = props;

  // Value type
  type ValueType = T[D];
  const [localValues, setValues] = React.useState<ValueType[]>(values);

  const updateValue = (value?: T[D]) => {
    if (onChange) onChange(value);
  };

  const doChange = (
    index: number,
    event: React.SyntheticEvent,
    value: AutocompleteValue<T, false, false, false>,
    reason: AutocompleteChangeReason
  ) => {
    if (onItemChange) {
      onItemChange(event, value, reason);
      if (event.isDefaultPrevented()) return;
    }

    const newValues = [...localValues.slice(0, index)];
    if (value) newValues.push(value[idField]);

    setValues(newValues);
  };

  React.useEffect(() => {
    setValues(values);
  }, [values.toString()]);

  const currentValue = localValues.at(-1);
  React.useEffect(() => {
    updateValue(currentValue);
  }, [currentValue]);

  return (
    <React.Fragment>
      {label && (
        <Grid item xs={12}>
          <FormLabel
            required={required}
            sx={{ fontSize: (theme) => theme.typography.caption }}
          >
            {label}
          </FormLabel>
        </Grid>
      )}
      <input type="hidden" name={name} value={`${currentValue ?? ""}`} />
      <Grid item {...breakPoints}>
        <Tiplist<T, D>
          idField={idField}
          label="1"
          name="tab1"
          search={search}
          fullWidth
          idValue={values[0]}
          loadData={(keyword, id, items) => loadData(keyword, id, items)}
          inputRequired={required}
          inputError={error}
          inputHelperText={helperText}
          onChange={(event, value, reason) => doChange(0, event, value, reason)}
        />
      </Grid>
      {localValues[0] != null && (
        <Grid item {...breakPoints}>
          <Tiplist<T, D>
            key={`${localValues[0]}`}
            label="2"
            idField={idField}
            name="tab2"
            search={search}
            fullWidth
            loadData={(keyword, id, items) =>
              loadData(keyword, id, items, localValues[0])
            }
            idValue={values[1]}
            onChange={(event, value, reason) =>
              doChange(1, event, value, reason)
            }
          />
        </Grid>
      )}
      {localValues[1] != null && (
        <Grid item {...breakPoints}>
          <Tiplist<T, D>
            key={`${localValues[1]}`}
            label="3"
            idField={idField}
            name="tab3"
            search={search}
            fullWidth
            loadData={(keyword, id, items) =>
              loadData(keyword, id, items, localValues[1])
            }
            idValue={values[2]}
            onChange={(event, value, reason) =>
              doChange(2, event, value, reason)
            }
          />
        </Grid>
      )}
      {localValues[2] != null && (
        <Grid item {...breakPoints}>
          <Tiplist<T, D>
            key={`${localValues[2]}`}
            label="4"
            idField={idField}
            name="tab4"
            search={search}
            fullWidth
            loadData={(keyword, id, items) =>
              loadData(keyword, id, items, localValues[2])
            }
            idValue={values[3]}
            onChange={(event, value, reason) =>
              doChange(3, event, value, reason)
            }
          />
        </Grid>
      )}
    </React.Fragment>
  );
}
