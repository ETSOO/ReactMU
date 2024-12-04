import { ReactUtils, useDelayedExecutor } from "@etsoo/react";
import { DataTypes, ListType2 } from "@etsoo/shared";
import { Autocomplete, AutocompleteProps } from "@mui/material";
import React, { ChangeEventHandler } from "react";
import { InputField, InputFieldProps } from "./InputField";
import { globalApp } from "./app/ReactApp";

/**
 * TiplistPro props
 */
export type TiplistProProps<T extends ListType2 = ListType2> = Omit<
  AutocompleteProps<T, false, false, true>,
  "open" | "multiple" | "options" | "renderInput"
> & {
  /**
   * Load data callback
   */
  loadData: (
    keyword: string | undefined,
    id: T["id"] | undefined,
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

  /**
   * Label
   */
  label?: string;

  /**
   * Field name
   */
  name?: string;

  /**
   * Id value
   */
  idValue?: T["id"] | null;

  /**
   * Input onChange hanlder
   */
  inputOnChange?: ChangeEventHandler<HTMLInputElement> | undefined;

  /**
   * Input props
   */
  inputProps?: Omit<InputFieldProps, "onChange">;

  /**
   * Set 'data-reset'
   */
  inputReset?: boolean;

  /**
   * Value change handler
   * @param value New value
   */
  onValueChange?: (value: T | null) => void;

  /**
   * Minimum characters to trigger the change event
   */
  minChars?: number;
};

// Multiple states
interface States<T extends object> {
  open: boolean;
  options: T[];
  value?: T | string | null | undefined;
  loading?: boolean;
}

/**
 * TiplistPro
 * @param props Props
 * @returns Component
 */
export function TiplistPro<T extends ListType2 = ListType2>(
  props: TiplistProProps<T>
) {
  // Labels
  const {
    noOptions,
    loading,
    more,
    open: openDefault
  } = globalApp?.getLabels("noOptions", "loading", "more", "open") ?? {};

  // Destruct
  const {
    label,
    loadData,
    defaultValue,
    value,
    idValue,
    maxItems = 16,
    width,
    name,
    inputOnChange,
    inputProps,
    inputReset,
    sx,
    openOnFocus = true,
    noOptionsText = noOptions,
    loadingText = loading,
    openText = openDefault,
    getOptionDisabled,
    getOptionLabel,
    onChange,
    onValueChange,
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
    idValue ??
    (localValue != null && typeof localValue === "object"
      ? localValue.id
      : null);

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

  React.useEffect(() => {
    if (localValue != value) stateUpdate({ value: localValue });
  }, [localValue]);

  // Input value
  const inputValue = React.useMemo(
    () =>
      states.value && typeof states.value === "object"
        ? states.value.id
        : undefined,
    [states.value]
  );

  // Ref
  const state = React.useRef({
    idLoaded: false,
    idSet: false,
    isMounted: false
  });

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
  const loadDataDirect = (keyword?: string, id?: T["id"]) => {
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
        options.push({ id: -1, name: "n/a" } as T);
      }

      if (id && options && onValueChange) {
        const option = options.find((o) => o["id"] === id);
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
      const newValue = value?.id.toString() ?? "";
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
          stateUpdate({
            value: states.options.find((o) => o.id === localIdValue)
          });
          state.current.idSet = true;
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
        type="text"
        style={{ display: "none" }}
        name={name}
        value={inputValue ?? (state.current.idSet ? "" : localIdValue ?? "")}
        readOnly
        onChange={inputOnChange}
      />
      {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
      <Autocomplete<T, false, false, true>
        filterOptions={(options, _state) => options}
        value={states.value}
        options={states.options}
        freeSolo
        clearOnBlur={false}
        onChange={(event, value, reason, details) => {
          if (typeof value === "object") {
            // Set value
            setInputValue(value);
          }

          // Custom
          if (onChange != null) onChange(event, value, reason, details);

          if (onValueChange) {
            if (typeof value === "object")
              onValueChange(value == null ? null : value);
          }

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
              states.value && typeof states.value === "object"
                ? states.value.id
                : undefined
            );
        }}
        onClose={() => {
          stateUpdate({
            open: false,
            ...(!states.value && { options: [] })
          });
        }}
        loading={states.loading}
        renderInput={(params) => (
          <InputField
            minChars={minChars}
            {...inputProps}
            {...params}
            onChange={changeHandle}
            label={label}
            name={name + "Input"}
            onBlur={(event) => {
              if (states.value == null && onChange)
                onChange(event, event.target.value, "blur", undefined);
            }}
            data-reset={inputReset}
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        sx={sx}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        openText={openText}
        getOptionDisabled={(item) => {
          if (item.id === -1) return true;
          return getOptionDisabled ? getOptionDisabled(item) : false;
        }}
        getOptionLabel={(item) => {
          if (typeof item === "string") return item;
          if (item["id"] === -1) return (more ?? "More") + "...";
          if (getOptionLabel == null) return DataTypes.getListItemLabel(item);
          return getOptionLabel(item);
        }}
        {...rest}
      />
    </div>
  );
}
