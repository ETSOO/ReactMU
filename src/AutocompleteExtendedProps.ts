import { DataTypes } from "@etsoo/shared";
import { AutocompleteProps } from "@mui/material";
import { ChangeEventHandler } from "react";

/**
 * Autocomplete extended props
 */
export type AutocompleteExtendedProps<
  T extends object,
  D extends DataTypes.Keys<T>,
  M extends boolean | undefined = boolean | undefined
> = Omit<
  AutocompleteProps<T, M, false, false>,
  "renderInput" | "options" | "multiple"
> & {
  /**
   * Id field
   */
  idField?: D;

  /**
   * Id value
   */
  idValue?: T[D];

  /**
   * Autocomplete for the input
   */
  inputAutoComplete?: string;

  /**
   * If `true`, the label is displayed in an error state.
   * @default false
   */
  inputError?: boolean;

  /**
   * The helper text content.
   */
  inputHelperText?: React.ReactNode;

  /**
   * If `dense` or `normal`, will adjust vertical spacing of this and contained components.
   * @default 'none'
   */
  inputMargin?: "dense" | "normal" | "none";

  /**
   * Input onChange hanlder
   */
  inputOnChange?: ChangeEventHandler<HTMLInputElement> | undefined;

  /**
   * If `true`, the label will indicate that the `input` is required.
   * @default false
   */
  inputRequired?: boolean;

  /**
   * The variant to use.
   * @default 'outlined'
   */
  inputVariant?: "standard" | "outlined" | "filled";

  /**
   * Label of the field
   */
  label: string;

  /**
   * Name of the field
   */
  name: string;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Is search field?
   */
  search?: boolean;

  /**
   * Value change handler
   * @param value New value
   */
  onValueChange?: (value: T | null) => void;
};
