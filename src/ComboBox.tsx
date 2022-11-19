import {
    DataTypes,
    IdDefaultType,
    Keyboard,
    LabelDefaultType,
    ListType
} from '@etsoo/shared';
import { Autocomplete, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';
import { Utils as SharedUtils } from '@etsoo/shared';
import { AutocompleteExtendedProps } from './AutocompleteExtendedProps';
import { InputField } from './InputField';
import { SearchField } from './SearchField';
import { ReactUtils } from '@etsoo/react';

/**
 * ComboBox props
 */
export type ComboBoxProps<
    T extends object,
    D extends DataTypes.Keys<T>,
    L extends DataTypes.Keys<T, string>
> = AutocompleteExtendedProps<T, D> & {
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
    // Destruct
    const {
        search = false,
        autoAddBlankItem = search,
        idField = 'id' as D,
        idValue,
        inputError,
        inputHelperText,
        inputMargin,
        inputOnChange,
        inputRequired,
        inputVariant,
        defaultValue,
        label,
        labelField = 'label' as L,
        loadData,
        onLoadData,
        name,
        inputAutoComplete = 'new-password', // disable autocomplete and autofill, 'off' does not work
        options,
        dataReadonly = true,
        readOnly,
        onChange,
        openOnFocus = true,
        value,
        getOptionLabel = (option: T) => `${option[labelField]}`,
        sx = { minWidth: '150px' },
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
        if (propertyWay && options != null) setOptions(options);
    }, [options, propertyWay]);

    // Local default value
    let localValue =
        idValue != null
            ? localOptions.find((o) => o[idField] === idValue)
            : defaultValue ?? value;

    if (localValue === undefined) localValue = null;

    // State
    // null for controlled
    const [stateValue, setStateValue] = React.useState<T | null>(null);

    // Current id value
    // One time calculation for input's default value (uncontrolled)
    const localIdValue = stateValue && stateValue[idField];

    React.useEffect(() => {
        if (localValue != null) setStateValue(localValue);
    }, [localValue]);

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });

            if (readOnly) {
                Object.assign(params.inputProps, { 'data-reset': true });
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

    const setInputValue = (value: T | null) => {
        // Set state
        setStateValue(value);

        // Input value
        const input = inputRef.current;
        if (input) {
            // Update value
            const newValue = value != null ? `${value[idField]}` : '';

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
    }, [propertyWay]);

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
                style={{ display: 'none' }}
                name={name}
                value={`${localIdValue ?? ''}`}
                readOnly
                onChange={inputOnChange}
            />
            {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
            <Autocomplete<T, undefined, false, false>
                value={stateValue}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={(option: T, value: T) =>
                    option[idField] === value[idField]
                }
                onChange={(event, value, reason, details) => {
                    // Set value
                    setInputValue(value);

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);
                }}
                openOnFocus={openOnFocus}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField
                            {...addReadOnly(params)}
                            label={label}
                            name={name + 'Input'}
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
                            name={name + 'Input'}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                            error={inputError}
                            helperText={inputHelperText}
                        />
                    )
                }
                options={localOptions}
                {...rest}
            />
        </div>
    );
}
