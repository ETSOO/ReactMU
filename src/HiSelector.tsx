import { DataTypes, IdDefaultType, LabelDefaultType } from '@etsoo/shared';
import { FormLabel, Grid, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { SelectEx } from './SelectEx';

/**
 * Hierarchy selector props
 */
export type HiSelectorProps<
    T extends object,
    D extends DataTypes.Keys<T> = IdDefaultType<T>,
    L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
> = {
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
     * Label field
     */
    labelField?: L;

    /**
     * Load data callback
     */
    loadData: (parent?: T[D]) => PromiseLike<T[] | null | undefined>;

    /**
     * On value change event
     */
    onChange?: (value: unknown) => void;

    /**
     * On select change event
     */
    onSelectChange?: (e: SelectChangeEvent<unknown>) => void;

    /**
     * Item change callback
     */
    onItemChange?: (option?: T) => void;

    /**
     * Required
     */
    required?: boolean;

    /**
     * Values
     */
    values?: T[D][];
};

/**
 * Hierarchy selector
 * @param props Prop
 * @returns Component
 */
export function HiSelector<
    T extends object,
    D extends DataTypes.Keys<T> = IdDefaultType<T>,
    L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: HiSelectorProps<T, D, L>) {
    // Destruct
    const {
        idField = 'id' as D,
        error,
        helperText,
        name,
        label = name,
        labelField = 'name' as L,
        loadData,
        onChange,
        onSelectChange,
        onItemChange,
        required,
        values = []
    } = props;

    // Value type
    type ValueType = T[D];
    const [localValues, setValues] = React.useState<ValueType[]>(values);

    const updateValue = (value?: T[D]) => {
        if (onChange) onChange(value);
    };

    const doChange = (event: SelectChangeEvent<unknown>, index: number) => {
        const value = event.target.value;
        const itemValue = value === '' ? undefined : (value as T[D]);
        updateValue(itemValue);

        const newValues = [...localValues.slice(0, index)];
        if (itemValue != null) newValues.push(itemValue);
        setValues(newValues);

        if (onSelectChange) onSelectChange(event);
    };

    const doItemChange = (option: T | undefined, userAction: boolean) => {
        if (onItemChange == null) return;
        if (
            !userAction &&
            (option == null || option[idField] !== values.at(-1))
        )
            return;
        onItemChange(option);
    };

    React.useEffect(() => {
        if (values.length > 0) {
            setValues(values);
            updateValue(values.at(-1));
        }
    }, [values]);

    const currentValue = localValues.at(-1);

    return (
        <React.Fragment>
            <Grid item xs={12}>
                <FormLabel
                    required={required}
                    sx={{ fontSize: (theme) => theme.typography.caption }}
                >
                    {label}
                </FormLabel>
                <input
                    type="hidden"
                    name={name}
                    value={`${currentValue ?? ''}`}
                />
            </Grid>
            <Grid item xs={6} md={4} lg={3}>
                <SelectEx<T, D, L>
                    idField={idField}
                    labelField={labelField}
                    name="tab1"
                    search
                    fullWidth
                    loadData={() => loadData()}
                    value={values[0]}
                    onChange={(event) => doChange(event, 0)}
                    onItemChange={doItemChange}
                    inputRequired={required}
                    error={error}
                    helperText={helperText}
                />
            </Grid>
            {localValues[0] != null && (
                <Grid item xs={6} md={4} lg={3}>
                    <SelectEx<T, D, L>
                        key={`${localValues[0]}`}
                        idField={idField}
                        labelField={labelField}
                        name="tab2"
                        search
                        fullWidth
                        loadData={() => loadData(localValues[0])}
                        value={values[1]}
                        onChange={(event) => doChange(event, 1)}
                        onItemChange={doItemChange}
                    />
                </Grid>
            )}
            {localValues[1] != null && (
                <Grid item xs={6} md={4} lg={3}>
                    <SelectEx<T, D, L>
                        key={`${localValues[1]}`}
                        idField={idField}
                        labelField={labelField}
                        name="tab3"
                        search
                        fullWidth
                        loadData={() => loadData(localValues[1])}
                        value={values[2]}
                        onChange={(event) => doChange(event, 2)}
                        onItemChange={doItemChange}
                    />
                </Grid>
            )}
            {localValues[2] != null && (
                <Grid item xs={6} md={4} lg={3}>
                    <SelectEx<T, D, L>
                        key={`${localValues[2]}`}
                        idField={idField}
                        labelField={labelField}
                        name="tab4"
                        search
                        fullWidth
                        loadData={() => loadData(localValues[2])}
                        value={values[3]}
                        onChange={(event) => doChange(event, 3)}
                        onItemChange={doItemChange}
                    />
                </Grid>
            )}
        </React.Fragment>
    );
}
