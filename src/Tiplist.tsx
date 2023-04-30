import { ReactUtils, useDelayedExecutor } from "@etsoo/react";
import { DataTypes, IdDefaultType, ListType } from "@etsoo/shared";
import { Autocomplete, AutocompleteRenderInputParams } from "@mui/material";
import React from "react";
import { AutocompleteExtendedProps } from "./AutocompleteExtendedProps";
import { globalApp } from "./app/ReactApp";
import { SearchField } from "./SearchField";
import { InputField } from "./InputField";

/**
 * Tiplist props
 */
export type TiplistProps<T extends object, D extends DataTypes.Keys<T>> = Omit<
  AutocompleteExtendedProps<T, D, undefined>,
  "open" | "multiple"
> & {
  /**
   * Load data callback
   */
  loadData: (
    keyword: string | undefined,
    id: T[D] | undefined,
    maxItems: number
  ) => PromiseLike<T[] | null | undefined>;

  /**
   * Max items to read and display
   */
  maxItems?: number;

  /**
   * Width
   */
  width?: number;
};

// Multiple states
interface States<T extends object> {
  open: boolean;
  options: T[];
  value?: T | null;
  loading?: boolean;
}

/**
 * Tiplist
 * @param props Props
 * @returns Component
 */
export function Tiplist<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: TiplistProps<T, D>) {
  // Labels
  const {
    noOptions,
    loading,
    more,
    open: openDefault
  } = globalApp?.getLabels("noOptions", "loading", "more", "open") ?? {};

  // Destruct
  const {
    search = false,
    idField = "id" as D,
    idValue,
    inputAutoComplete = "off",
    inputError,
    inputHelperText,
    inputMargin,
    inputOnChange,
    inputRequired,
    inputVariant,
    label,
    loadData,
    defaultValue,
    value,
    maxItems = 16,
    width = search ? 160 : undefined,
    name,
    readOnly,
    onChange,
    onValueChange,
    openOnFocus = true,
    noOptionsText = noOptions,
    loadingText = loading,
    openText = openDefault,
    getOptionLabel,
    getOptionDisabled,
    sx = {},
    ...rest
  } = props;

  if (width && sx) Object.assign(sx, { width: `${width}px` });

  // Value input ref
  const inputRef = React.createRef<HTMLInputElement>();

  // Local value
  let localValue = value ?? defaultValue;

  // One time calculation for input's default value (uncontrolled)
  const localIdValue =
    idValue ?? DataTypes.getValue(localValue, idField as any);

  // Changable states
  const [states, stateUpdate] = React.useReducer(
    (currentState: States<T>, newState: Partial<States<T>>) => {
      return { ...currentState, ...newState };
    },
    {
      // Loading unknown
      open: false,
      options: [],
      value: null
    }
  );

  // Input value
  const inputValue = React.useMemo(
    () =>
      states.value && typeof states.value === "object"
        ? states.value[idField]
        : undefined,
    [states.value]
  );

  React.useEffect(() => {
    if (localValue != null) stateUpdate({ value: localValue });
  }, [localValue]);

  // State
  const [state] = React.useState<{
    idLoaded?: boolean;
    idSet?: boolean;
  }>({});
  const isMounted = React.useRef(true);

  // Add readOnly
  const addReadOnly = (params: AutocompleteRenderInputParams) => {
    if (readOnly != null) {
      Object.assign(params, { readOnly });
    }

    // https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
    // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
    Object.assign(params.inputProps, { autoComplete: inputAutoComplete });

    return params;
  };

  // Change handler
  const changeHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Stop processing with auto trigger event
    if (event.nativeEvent.cancelable && !event.nativeEvent.composed) {
      stateUpdate({ options: [] });
      return;
    }

    // Stop bubble
    event.stopPropagation();

    // Call with delay
    delayed.call(undefined, event.currentTarget.value);
  };

  // Directly load data
  const loadDataDirect = (keyword?: string, id?: T[D]) => {
    // Reset options
    // setOptions([]);

    if (id == null) {
      // Reset real value
      const input = inputRef.current;

      if (input && input.value !== "") {
        // Different value, trigger change event
        ReactUtils.triggerChange(input, "", false);
      }

      if (states.options.length > 0) {
        // Reset options
        stateUpdate({ options: [] });
      }
    }

    // Loading indicator
    if (!states.loading) stateUpdate({ loading: true });

    // Load list
    loadData(keyword, id, maxItems).then((options) => {
      if (!isMounted.current) return;

      if (options != null && options.length >= maxItems) {
        options.push({ [idField]: "n/a" } as T);
      }

      if (id && options && onValueChange) {
        const option = options.find((o) => o[idField] === id);
        if (option) onValueChange(option);
      }

      // Indicates loading completed
      stateUpdate({
        loading: false,
        ...(options != null && { options })
      });
    });
  };

  const delayed = useDelayedExecutor(loadDataDirect, 480);

  const setInputValue = (value: T | null) => {
    stateUpdate({ value });

    // Input value
    const input = inputRef.current;
    if (input) {
      // Update value
      const newValue = DataTypes.getStringValue(value, idField) ?? "";
      if (newValue !== input.value) {
        // Different value, trigger change event
        ReactUtils.triggerChange(input, newValue, false);
      }
    }
  };

  React.useEffect(() => {
    if (localIdValue == null && inputValue != null) {
      setInputValue(null);
    }
  }, [localIdValue]);

  React.useEffect(() => {
    if (localIdValue != null && (localIdValue as any) !== "") {
      if (state.idLoaded) {
        // Set default
        if (!state.idSet && states.options.length > 0) {
          stateUpdate({
            value: states.options.find((o) => o[idField] === localIdValue)
          });
          state.idSet = true;
        }
      } else {
        // Load id data
        loadDataDirect(undefined, localIdValue);
        state.idLoaded = true;
      }
    }
  }, [state.idLoaded, state.idSet, localIdValue, states.options]);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      delayed.clear();
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
        value={`${inputValue ?? ""}`}
        readOnly
        onChange={inputOnChange}
      />
      {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
      <Autocomplete<T, undefined, false, false>
        filterOptions={(options, _state) => options}
        value={states.value}
        options={states.options}
        onChange={(event, value, reason, details) => {
          // Set value
          setInputValue(value);

          // Custom
          if (onChange != null) onChange(event, value, reason, details);

          if (onValueChange) onValueChange(value);

          // For clear case
          if (reason === "clear") {
            stateUpdate({ options: [] });
            loadDataDirect();
          }
        }}
        open={states.open}
        openOnFocus={openOnFocus}
        onOpen={() => {
          // Should load
          const loading = states.loading ? true : states.options.length === 0;

          stateUpdate({ open: true, loading });

          // If not loading
          if (loading)
            loadDataDirect(
              undefined,
              states.value == null ? undefined : states.value[idField]
            );
        }}
        onClose={() => {
          stateUpdate({
            open: false,
            ...(!states.value && { options: [] })
          });
        }}
        loading={states.loading}
        renderInput={(params) =>
          search ? (
            <SearchField
              onChange={changeHandle}
              {...addReadOnly(params)}
              readOnly={readOnly}
              label={label}
              name={name + "Input"}
              margin={inputMargin}
              variant={inputVariant}
              required={inputRequired}
              autoComplete={inputAutoComplete}
              error={inputError}
              helperText={inputHelperText}
            />
          ) : (
            <InputField
              onChange={changeHandle}
              {...addReadOnly(params)}
              label={label}
              name={name + "Input"}
              margin={inputMargin}
              variant={inputVariant}
              required={inputRequired}
              autoComplete={inputAutoComplete}
              error={inputError}
              helperText={inputHelperText}
            />
          )
        }
        isOptionEqualToValue={(option, value) =>
          option[idField] === value[idField]
        }
        sx={sx}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        openText={openText}
        getOptionDisabled={(item) => {
          if (item[idField] === "n/a") return true;
          return getOptionDisabled ? getOptionDisabled(item) : false;
        }}
        getOptionLabel={(item) => {
          if (typeof item !== "object") return `${item}`;
          if (item[idField] === "n/a") return (more ?? "More") + "...";
          return getOptionLabel
            ? getOptionLabel(item)
            : "label" in item
            ? `${item.label}`
            : "name" in item
            ? `${item.name}`
            : `${item}`;
        }}
        {...rest}
      />
    </div>
  );
}
