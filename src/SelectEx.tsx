import {
    Checkbox,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    SelectProps,
    Stack
} from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';
import { ListItemRightIcon } from './ListItemRightIcon';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    DataTypes,
    IdDefaultType,
    LabelDefaultType,
    ListType,
    Utils
} from '@etsoo/shared';

/**
 * Extended select component props
 */
export type SelectExProps<
    T extends object,
    D extends DataTypes.Keys<T> = IdDefaultType<T>,
    L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
> = Omit<SelectProps, 'labelId' | 'input' | 'native'> & {
    /**
     * Auto add blank item
     */
    autoAddBlankItem?: boolean;

    /**
     * The helper text content.
     */
    helperText?: React.ReactNode;

    /**
     * Input required
     */
    inputRequired?: boolean;

    /**
     * Id field
     */
    idField?: D;

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
        idField = 'id' as D,
        error,
        helperText,
        inputRequired,
        itemIconRenderer,
        itemStyle,
        label,
        labelField = 'label' as L,
        loadData,
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
        ...rest
    } = props;

    // Options state
    const [localOptions, setOptions] = React.useState<readonly T[]>([]);
    const isMounted = React.useRef(true);

    const doItemChange = (
        options: readonly T[],
        value: unknown,
        userAction: boolean
    ) => {
        if (onItemChange == null) return;
        if (value == null || value === '') {
            onItemChange(undefined, userAction);
            return;
        }
        const option = options.find((option) => option[idField] === value);
        onItemChange(option, userAction);
    };

    const setOptionsAdd = (options: readonly T[]) => {
        setOptions(options);
        if (localValue != null && localValue !== '')
            doItemChange(options, localValue, false);
    };

    // When options change
    // [options] will cause infinite loop
    const propertyWay = loadData == null;
    React.useEffect(() => {
        if (options == null || !propertyWay) return;
        setOptionsAdd(options);
    }, [options, propertyWay]);

    // Local value
    const valueSource = defaultValue ?? value ?? '';
    let localValue: unknown | unknown[];
    if (multiple) {
        if (Array.isArray(valueSource)) localValue = valueSource;
        else localValue = [valueSource];
    } else {
        localValue = valueSource;
    }

    // Value state
    const [valueState, setValueState] = React.useState<unknown>();

    React.useEffect(() => {
        if (localValue != null) setValueState(localValue);
    }, [localValue]);

    // Label id
    const labelId = `selectex-label-${name}`;

    // Item checked or not
    const itemChecked = (id: unknown) => {
        if (Array.isArray(valueState)) return valueState.indexOf(id) !== -1;
        return valueState === id;
    };

    // Change handler
    const handleChange = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value;
        if (multiple && !Array.isArray(value)) setItemValue([value]);
        else setItemValue(value);
    };

    // Set item
    const setItemValue = (id: unknown) => {
        if (id != valueState) {
            setValueState(id);

            /*
            const input = divRef.current?.querySelector('input');
            if (input) {
                // Different value, trigger change event
                ReactUtils.triggerChange(input, id as string, false);
            }
            */
        }
    };

    // Get option id
    const getId = (option: T) => {
        return option[idField] as unknown as React.Key;
    };

    // Get option label
    const getLabel = (option: T) => {
        return typeof labelField === 'function'
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
            if (autoAddBlankItem) {
                Utils.addBlankItem(result, idField, labelField);
            }
            setOptionsAdd(result);
        });
    };

    // When value change
    React.useEffect(() => {
        refreshData();
    }, [localValue]);

    // When layout ready
    React.useEffect(() => {
        const input = divRef.current?.querySelector('input');
        const inputChange = (event: Event) => {
            // Reset case
            if (event.cancelable) setValueState(multiple ? [] : '');
        };
        input?.addEventListener('change', inputChange);

        return () => {
            isMounted.current = false;
            input?.removeEventListener('change', inputChange);
        };
    }, []);

    // Layout
    return (
        <Stack direction="row">
            <FormControl
                size={
                    search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize
                }
                fullWidth={fullWidth}
                error={error}
            >
                <InputLabel
                    id={labelId}
                    shrink={
                        search
                            ? MUGlobal.searchFieldShrink
                            : MUGlobal.inputFieldShrink
                    }
                >
                    {label}
                </InputLabel>
                <Select
                    ref={divRef}
                    value={
                        localOptions.some((option) =>
                            itemChecked(getId(option))
                        )
                            ? valueState ?? ''
                            : ''
                    }
                    input={
                        <OutlinedInput
                            notched
                            label={label}
                            required={inputRequired}
                        />
                    }
                    labelId={labelId}
                    name={name}
                    multiple={multiple}
                    onChange={(event, child) => {
                        if (onChange) {
                            onChange(event, child);

                            // event.preventDefault() will block executing
                            if (event.defaultPrevented) return;
                        }
                        doItemChange(localOptions, event.target.value, true);
                        handleChange(event);
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
                            .join(', ');
                    }}
                    sx={{ minWidth: '150px' }}
                    fullWidth={fullWidth}
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
                                value={id}
                                onClick={(event) => {
                                    if (onItemClick) {
                                        onItemClick(event, option);
                                    }
                                }}
                                style={
                                    itemStyle == null
                                        ? undefined
                                        : itemStyle(option)
                                }
                            >
                                {multiple && (
                                    <Checkbox checked={itemChecked(id)} />
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
                {helperText != null && (
                    <FormHelperText>{helperText}</FormHelperText>
                )}
            </FormControl>
            {refresh != null &&
                loadData != null &&
                (typeof refresh === 'string' ? (
                    <IconButton
                        size="small"
                        title={refresh}
                        onClick={refreshData}
                    >
                        <RefreshIcon />
                    </IconButton>
                ) : (
                    refresh
                ))}
        </Stack>
    );
}
