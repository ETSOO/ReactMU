import {
  DataTypes,
  IdDefaultType,
  Keyboard,
  LabelDefaultType,
  ListType
} from "@etsoo/shared";
import { Autocomplete, AutocompleteRenderInputParams } from "@mui/material";
import React from "react";
import { Utils as SharedUtils } from "@etsoo/shared";
import { ReactUtils } from "@etsoo/react";
import { AutocompleteExtendedProps } from "./AutocompleteExtendedProps";
import { SearchField } from "./SearchField";
import { InputField } from "./InputField";
import { globalApp } from "./app/ReactApp";

/**
 * ComboBox props
 */
export type ComboBoxProps<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
> = AutocompleteExtendedProps<T, D, false> & {
  /**
   * Auto add blank item
   */
  autoAddBlankItem?: boolean;

  /**
   * Data readonly
   */
  dataReadonly?: boolean;

  /**
   * Label field
   */
  labelField?: L;

  /**
   * Load data callback
   */
  loadData?: () => PromiseLike<T[] | null | undefined>;

  /**
   * On load data handler
   */
  onLoadData?: (options: T[]) => void;

  /**
   * Array of options.
   */
  options?: ReadonlyArray<T>;
};

/**
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: ComboBoxProps<T, D, L>) {
  // Labels
  const labels = globalApp?.getLabels("noOptions", "loading", "open");

  // Destruct
  const {
    search = false,
    autoAddBlankItem = search,
    idField = "id" as D,
    idValue,
    inputError,
    inputHelperText,
    inputMargin,
    inputOnChange,
    inputRequired,
    inputVariant,
    defaultValue,
    label,
    labelField = "label" as L,
    loadData,
    onLoadData,
    name,
    inputAutoComplete = "off",
    options,
    dataReadonly = true,
    readOnly,
    onChange,
    openOnFocus = true,
    value,
    disableCloseOnSelect = false,
    getOptionLabel = (option: T) => `${option[labelField]}`,
    sx = { minWidth: "150px" },
    noOptionsText = labels?.noOptions,
    loadingText = labels?.loading,
    openText = labels?.open,
    ...rest
  } = props;

  // Value input ref
  const inputRef = React.createRef<HTMLInputElement>();

  // Options state
  const [localOptions, setOptions] = React.useState(options ?? []);
  const isMounted = React.useRef(true);

  // When options change
  // [options] will cause infinite loop
  const propertyWay = loadData == null;
  React.useEffect(() => {
    if (propertyWay && options != null) {
      setOptions(options);
      if (
        stateValue != null &&
        !options.some((option) => option[idField] === stateValue[idField])
      ) {
        setStateValue(null);
      }
    }
  }, [options, propertyWay]);

  // Local default value
  const localValue: T | null | undefined =
    idValue != null
      ? localOptions.find((o) => o[idField] === idValue)
      : defaultValue ?? value;

  // State
  // null for controlled
  const [stateValue, setStateValue] = React.useState<T | null>(null);

  React.useEffect(() => {
    if (localValue != null && localValue != stateValue) {
      setStateValue(localValue);
    }
  }, [localValue]);

  // Add readOnly
  const addReadOnly = (params: AutocompleteRenderInputParams) => {
    if (readOnly != null) {
      Object.assign(params, { readOnly });

      if (readOnly) {
        Object.assign(params.inputProps, { "data-reset": true });
      }
    }

    if (dataReadonly) {
      params.inputProps.onKeyDown = (event) => {
        if (Keyboard.isTypingContent(event.key)) {
          event.preventDefault();
        }
      };
    }

    // https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
    // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
    Object.assign(params.inputProps, { autoComplete: inputAutoComplete });

    return params;
  };

  const getValue = (value: T | null): string => {
    if (value == null) return "";
    if (Array.isArray(value))
      return value.map((item) => item[idField]).join(",");
    return `${value[idField]}`;
  };

  const setInputValue = (value: T | null) => {
    // Set state
    setStateValue(value);

    // Input value
    const input = inputRef.current;
    if (input) {
      // Update value
      const newValue = getValue(value);

      if (newValue !== input.value) {
        // Different value, trigger change event
        ReactUtils.triggerChange(input, newValue, false);
      }
    }
  };

  React.useEffect(() => {
    if (propertyWay || loadData == null) return;
    loadData().then((result) => {
      if (result == null || !isMounted.current) return;
      if (onLoadData) onLoadData(result);
      if (autoAddBlankItem) {
        SharedUtils.addBlankItem(result, idField, labelField);
      }
      setOptions(result);
    });
  }, [propertyWay, autoAddBlankItem, idField, labelField]);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Layout
  return (
    <div>
      <input
        ref={inputRef}
        data-reset="true"
        type="text"
        style={{ display: "none" }}
        name={name}
        value={getValue(stateValue)}
        readOnly
        onChange={inputOnChange}
      />
      {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
      <Autocomplete<T, false, false, false>
        value={stateValue}
        disableCloseOnSelect={disableCloseOnSelect}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option: T, value: T) =>
          option[idField] === value[idField]
        }
        onChange={(event, value, reason, details) => {
          // Set value
          setInputValue(value);

          // Custom
          if (onChange != null) onChange(event, value, reason, details);
        }}
        openOnFocus={openOnFocus}
        sx={sx}
        renderInput={(params) =>
          search ? (
            <SearchField
              {...addReadOnly(params)}
              label={label}
              name={name + "Input"}
              margin={inputMargin}
              variant={inputVariant}
              required={inputRequired}
              error={inputError}
              helperText={inputHelperText}
            />
          ) : (
            <InputField
              {...addReadOnly(params)}
              label={label}
              name={name + "Input"}
              margin={inputMargin}
              variant={inputVariant}
              required={inputRequired}
              error={inputError}
              helperText={inputHelperText}
            />
          )
        }
        options={localOptions}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        openText={openText}
        {...rest}
      />
    </div>
  );
}
