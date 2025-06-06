import React from "react";
import { MUGlobal } from "./MUGlobal";
import { ListItemRightIcon } from "./ListItemRightIcon";
import {
  ArrayUtils,
  DataTypes,
  IdDefaultType,
  LabelDefaultType,
  ListType,
  Utils
} from "@etsoo/shared";
import { ReactUtils } from "@etsoo/react";
import Select, { SelectProps, SelectVariants } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import FormHelperText from "@mui/material/FormHelperText";
import RefreshIcon from "@mui/icons-material/Refresh";

export type SelectExMethods = {
  /**
   * Set open state
   * @param isOpen Open state
   */
  setOpen: (isOpen: boolean) => void;
};

/**
 * Extended select component props
 */
export type SelectExProps<
  T extends object,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
> = Omit<SelectProps, "labelId" | "input" | "native" | "variant"> & {
  /**
   * Auto add blank item
   */
  autoAddBlankItem?: boolean;

  /**
   * The helper text content.
   */
  helperText?: React.ReactNode;

  /**
   * Id field
   */
  idField?: D;

  /**
   * Set 'data-reset'
   */
  inputReset?: boolean;

  /**
   * Item icon renderer
   */
  itemIconRenderer?: (id: T[D]) => React.ReactNode;

  /**
   * Item style
   */
  itemStyle?: (option: T) => React.CSSProperties;

  /**
   * Label field
   */
  labelField?: L | ((option: T) => string);

  /**
   * Load data callback
   */
  loadData?: () => PromiseLike<T[] | null | undefined>;

  /**
   * Methods
   */
  mRef?: React.Ref<SelectExMethods>;

  /**
   * Item change callback
   */
  onItemChange?: (option: T | undefined, userAction: boolean) => void;

  /**
   * Item click handler
   */
  onItemClick?: (event: React.MouseEvent, option: T) => void;

  /**
   * On load data handler
   */
  onLoadData?: (options: T[]) => void;

  /**
   * Array of options.
   */
  options?: ReadonlyArray<T>;

  /**
   * Supports refresh label or component
   */
  refresh?: string | React.ReactNode;

  /**
   * Is search case?
   */
  search?: boolean;

  /**
   * Variant
   */
  variant?: SelectVariants;
};

/**
 * Extended select component
 * @param props Props
 * @returns Component
 */
export function SelectEx<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: SelectExProps<T, D, L>) {
  // Destruct
  const {
    defaultValue,
    idField = "id" as D,
    error,
    helperText,
    inputReset,
    itemIconRenderer,
    itemStyle,
    label,
    labelField = "label" as L,
    loadData,
    mRef,
    onItemChange,
    onItemClick,
    onLoadData,
    multiple = false,
    name,
    options,
    refresh,
    search = false,
    autoAddBlankItem = search,
    value,
    onChange,
    fullWidth,
    required,
    variant = "outlined",
    ...rest
  } = props;

  // Options state
  const [localOptions, setOptions] = React.useState<readonly T[]>([]);
  const isMounted = React.useRef(false);

  const doItemChange = (
    options: readonly T[],
    value: unknown,
    userAction: boolean
  ) => {
    if (onItemChange == null) return;

    let option: T | undefined;
    if (multiple && Array.isArray(value)) {
      option = options.find((option) => value.includes(option[idField]));
    } else if (value == null || value === "") {
      option = undefined;
    } else {
      option = options.find((option) => option[idField] === value);
    }
    onItemChange(option, userAction);
  };

  // Local value
  const v = defaultValue ?? value;
  const valueSource = React.useMemo(
    () => (multiple ? (v ? (Array.isArray(v) ? v : [v]) : []) : v ?? ""),
    [multiple, v]
  );

  const setOptionsAdd = React.useCallback(
    (options: readonly T[]) => {
      const localOptions = [...options];
      if (autoAddBlankItem) {
        Utils.addBlankItem(localOptions, idField, labelField);
      }
      setOptions(localOptions);
      if (valueSource != null) doItemChange(options, valueSource, false);
    },
    [valueSource]
  );

  // When options change
  // [options] will cause infinite loop
  const propertyWay = loadData == null;
  React.useEffect(() => {
    if (options == null || !propertyWay) return;
    setOptionsAdd(options);
  }, [options, propertyWay, setOptionsAdd]);

  // Value state
  const [valueState, setValueStateBase] = React.useState<unknown>(valueSource);
  const valueRef = React.useRef<unknown>();
  const setValueState = (newValue: unknown) => {
    valueRef.current = newValue;
    setValueStateBase(newValue);
  };

  const [open, setOpen] = React.useState(false);

  React.useImperativeHandle(
    mRef,
    () => ({
      setOpen: (isOpen: boolean) => {
        setOpen(isOpen);
      }
    }),
    []
  );

  React.useEffect(() => {
    if (valueSource != null) setValueState(valueSource);
  }, [valueSource]);

  // Label id
  const labelId = `selectex-label-${name}`;

  // Set item
  const setItemValue = (id: unknown) => {
    if (id !== valueRef.current) {
      // Difference
      const diff = multiple
        ? ArrayUtils.differences(id as T[D][], valueRef.current as T[D][])
        : id;

      setValueState(id);

      const input = divRef.current?.querySelector("input");
      if (input) {
        // Different value, trigger change event
        ReactUtils.triggerChange(input, id as string, false);
      }
      return diff;
    }
    return undefined;
  };

  // Get option id
  const getId = (option: T) => {
    return option[idField] as unknown as React.Key;
  };

  // Get option label
  const getLabel = (option: T) => {
    return typeof labelField === "function"
      ? labelField(option)
      : (option[labelField] as string);
  };

  // Refs
  const divRef = React.useRef<HTMLDivElement>();

  // Refresh list data
  const refreshData = () => {
    if (loadData == null) return;
    loadData().then((result) => {
      if (result == null || !isMounted.current) return;
      if (onLoadData) onLoadData(result);
      setOptionsAdd(result);
    });
  };

  // When value change
  React.useEffect(() => {
    refreshData();
  }, [valueSource]);

  // When layout ready
  React.useEffect(() => {
    const input = divRef.current?.querySelector("input");
    const inputChange = (event: Event) => {
      // Reset case
      if (event.cancelable) setValueState(multiple ? [] : "");
    };
    input?.addEventListener("change", inputChange);

    isMounted.current = true;

    return () => {
      isMounted.current = false;
      input?.removeEventListener("change", inputChange);
    };
  }, [multiple]);

  // Layout
  return (
    <Stack direction="row">
      <FormControl
        size={search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize}
        fullWidth={fullWidth}
        error={error}
      >
        <InputLabel
          id={labelId}
          variant={variant}
          shrink={
            search ? MUGlobal.searchFieldShrink : MUGlobal.inputFieldShrink
          }
          required={required}
        >
          {label}
        </InputLabel>
        <Select
          ref={divRef}
          value={
            multiple
              ? valueState
              : localOptions.some((o) => o[idField] === valueState)
              ? valueState
              : ""
          }
          input={
            <OutlinedInput
              notched
              label={label}
              required={required}
              inputProps={{
                "aria-hidden": false,
                "data-reset": inputReset
              }}
            />
          }
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          labelId={labelId}
          name={name}
          multiple={multiple}
          onChange={(event, child) => {
            if (onChange) {
              onChange(event, child);

              // event.preventDefault() will block executing
              if (event.defaultPrevented) return;
            }

            // Set item value
            const value = event.target.value;
            if (multiple && !Array.isArray(value)) return;

            const diff = setItemValue(value);
            if (diff != null) {
              doItemChange(localOptions, diff, true);
            }
          }}
          renderValue={(selected) => {
            // The text shows up
            return localOptions
              .filter((option) => {
                const id = getId(option);
                return Array.isArray(selected)
                  ? selected.indexOf(id) !== -1
                  : selected === id;
              })
              .map((option) => getLabel(option))
              .join(", ");
          }}
          sx={{ minWidth: "150px" }}
          fullWidth={fullWidth}
          required={required}
          variant={variant}
          {...rest}
        >
          {localOptions.map((option) => {
            // Option id
            const id = getId(option);

            // Option label
            const label = getLabel(option);

            // Option
            return (
              <MenuItem
                key={id}
                value={id as any}
                onClick={(event) => {
                  if (onItemClick) {
                    onItemClick(event, option);
                  }
                }}
                style={itemStyle == null ? undefined : itemStyle(option)}
              >
                {multiple && (
                  <Checkbox
                    checked={
                      Array.isArray(valueState)
                        ? valueState.includes(id)
                        : valueState === id
                    }
                  />
                )}
                <ListItemText primary={label} />
                {itemIconRenderer && (
                  <ListItemRightIcon>
                    {itemIconRenderer(option[idField])}
                  </ListItemRightIcon>
                )}
              </MenuItem>
            );
          })}
        </Select>
        {helperText != null && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
      {refresh != null &&
        loadData != null &&
        (typeof refresh === "string" ? (
          <IconButton size="small" title={refresh} onClick={refreshData}>
            <RefreshIcon />
          </IconButton>
        ) : (
          refresh
        ))}
    </Stack>
  );
}
