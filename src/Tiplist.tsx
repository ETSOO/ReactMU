import { ReactUtils, useDelayedExecutor } from "@etsoo/react";
import { DataTypes, IdDefaultType, ListType2 } from "@etsoo/shared";
import React from "react";
import type { AutocompleteExtendedProps } from "./AutocompleteExtendedProps";
import { SearchField } from "./SearchField";
import { InputField } from "./InputField";
import { useAppContext } from "./app/ReactApp";
import Autocomplete, {
  AutocompleteRenderInputParams
} from "@mui/material/Autocomplete";

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
   * Minimum characters to trigger the change event
   */
  minChars?: number;

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
  T extends object = ListType2,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: TiplistProps<T, D>) {
  // Global app
  const app = useAppContext();

  // Labels
  const {
    noOptions,
    loading,
    more1 = "More",
    open: openDefault
  } = app?.getLabels("noOptions", "loading", "more1", "open") ?? {};

  // Destruct
  const {
    search = false,
    idField = "id" as D,
    idValue,
    idIsString = false,
    inputAutoComplete = "off",
    inputError,
    inputHelperText,
    inputMargin,
    inputOnChange,
    inputRequired,
    inputReset,
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
    getOptionKey = (option) => `${option[idField]}`,
    getOptionLabel,
    getOptionDisabled,
    sx = {},
    minChars,
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

  // Ref
  const state = React.useRef({
    idLoaded: false,
    idSet: false,
    isMounted: false
  });

  // Add readOnly
  const addReadOnly = (params: AutocompleteRenderInputParams) => {
    if (readOnly != null) {
      Object.assign(params, { readOnly });
    }

    // https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
    // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
    Object.assign(params.inputProps, {
      autoComplete: inputAutoComplete,
      "data-reset": inputReset
    });

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
      if (!state.current.isMounted) return;

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
    if (localIdValue == null) {
      if (inputValue != null) setInputValue(null);
      return;
    }

    if (state.current.idLoaded) {
      state.current.idLoaded = false;
      state.current.idSet = false;
    }
  }, [localIdValue]);

  React.useEffect(() => {
    if (localIdValue != null && (localIdValue as any) !== "") {
      if (state.current.idLoaded) {
        // Set default
        if (!state.current.idSet && states.options.length > 0) {
          const item = states.options.find((o) => o[idField] === localIdValue);
          if (item) {
            stateUpdate({
              value: states.options[0]
            });
            state.current.idSet = true;
          }
        }
      } else {
        // Load id data
        loadDataDirect(undefined, localIdValue);
        state.current.idLoaded = true;
      }
    }
  }, [localIdValue, states.options]);

  React.useEffect(() => {
    state.current.isMounted = true;
    return () => {
      state.current.isMounted = false;
      delayed.clear();
    };
  }, []);

  // Layout
  return (
    <div>
      <input
        ref={inputRef}
        data-reset={inputReset ?? true}
        type={idIsString ? "text" : "number"}
        style={{ display: "none" }}
        name={name}
        value={`${
          inputValue ?? (state.current.idSet ? "" : localIdValue ?? "")
        }`}
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
            stateUpdate({ options: [], open: event.type === "click" });
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
              minChars={minChars}
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
              minChars={minChars}
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
          if (item[idField] === "n/a") return more1;
          return getOptionLabel
            ? getOptionLabel(item)
            : DataTypes.getObjectItemLabel(item);
        }}
        getOptionKey={getOptionKey}
        {...rest}
      />
    </div>
  );
}
