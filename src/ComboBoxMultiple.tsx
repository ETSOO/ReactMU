import {
  DataTypes,
  IdDefaultType,
  Keyboard,
  LabelDefaultType,
  ListType
} from "@etsoo/shared";
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Checkbox
} from "@mui/material";
import React from "react";
import { Utils as SharedUtils } from "@etsoo/shared";
import { ReactUtils } from "@etsoo/react";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { AutocompleteExtendedProps } from "./AutocompleteExtendedProps";
import { SearchField } from "./SearchField";
import { InputField } from "./InputField";
import { globalApp } from "./app/ReactApp";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/**
 * ComboBox multiple props
 */
export type ComboBoxMultipleProps<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
> = Omit<AutocompleteExtendedProps<T, D, true>, "onValueChange"> & {
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

  /**
   * Id values
   */
  idValues?: T[D][];
};

/**
 * ComboBox multiple
 * @param props Props
 * @returns Component
 */
export function ComboBoxMultiple<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: ComboBoxMultipleProps<T, D, L>) {
  // Labels
  const labels = globalApp?.getLabels("noOptions", "loading");

  // Destruct
  const {
    search = false,
    autoAddBlankItem = search,
    idField = "id" as D,
    idValue,
    idValues,
    inputError,
    inputHelperText,
    inputMargin,
    inputOnChange,
    inputRequired,
    inputReset,
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
    disableCloseOnSelect = true,
    renderOption = (props, option, { selected }) => (
      <li {...props}>
        <>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option[labelField]}
        </>
      </li>
    ),
    getOptionLabel = (option: T) => `${option[labelField]}`,
    sx = { minWidth: "150px" },
    noOptionsText = labels?.noOptions,
    loadingText = labels?.loading,
    ...rest
  } = props;

  // Value input ref
  const inputRef = React.createRef<HTMLInputElement>();

  // Options state
  const [localOptions, setOptions] = React.useState(options ?? []);
  const isMounted = React.useRef(true);

  // Local default value
  const localValue: T[] | null | undefined =
    idValue != null
      ? localOptions.filter((o) => o[idField] === idValue)
      : idValues != null
      ? localOptions.filter((o) => idValues?.includes(o[idField]))
      : defaultValue?.concat() ?? value?.concat();

  // State
  // null for controlled
  const [stateValue, setStateValue] = React.useState<T[] | null>(null);

  React.useEffect(() => {
    setStateValue(localValue ?? []);
  }, [localValue]);

  // When options change
  // [options] will cause infinite loop
  const propertyWay = loadData == null;
  React.useEffect(() => {
    if (propertyWay && options != null) {
      setOptions(options);

      if (stateValue != null) {
        if (Array.isArray(stateValue)) {
          const newState = stateValue.filter((item) =>
            options.some((option) => option[idField] === item[idField])
          );
          setStateValue(newState);
        } else if (
          !options.some((option) => option[idField] === stateValue[idField])
        ) {
          setStateValue(null);
        }
      }
    }
  }, [options, propertyWay]);

  // Add readOnly
  const addReadOnly = (params: AutocompleteRenderInputParams) => {
    if (readOnly != null) {
      Object.assign(params, { readOnly });
    }

    Object.assign(params.inputProps, { "data-reset": inputReset });

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

  const getValue = (value: T[] | null): string => {
    if (value == null) return "";
    return value.map((item) => item[idField]).join(",");
  };

  const setInputValue = (value: T[] | null) => {
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
        data-reset={inputReset ?? true}
        type="text"
        style={{ display: "none" }}
        name={name}
        value={getValue(stateValue)}
        readOnly
        onChange={inputOnChange}
      />
      {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
      <Autocomplete<T, true, false, false>
        value={
          stateValue == null
            ? []
            : Array.isArray(stateValue)
            ? stateValue
            : [stateValue]
        }
        disableCloseOnSelect={disableCloseOnSelect}
        getOptionLabel={getOptionLabel}
        multiple
        isOptionEqualToValue={(option: T, value: T) =>
          option[idField] === value[idField]
        }
        onChange={(event, value, reason, details) => {
          // Set value
          setInputValue(value.concat());

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
        renderOption={renderOption}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        {...rest}
      />
    </div>
  );
}
