import {
    DataTypes,
    IdDefaultType,
    LabelDefaultType,
    ListType
} from '@etsoo/shared';
import React from 'react';
import { MUGlobal } from './MUGlobal';
import { OptionGroup, OptionGroupProps } from './OptionGroup';

/**
 * Search OptionGroup
 * @param props Props
 * @returns Component
 */
export function SearchOptionGroup<
    T extends object = ListType,
    D extends DataTypes.Keys<T> = IdDefaultType<T>,
    L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: OptionGroupProps<T, D, L>) {
    // Destruct
    const {
        row = true,
        size = MUGlobal.searchFieldSize,
        sx = { '& .MuiFormLabel-root': { fontSize: '0.75em' } },
        ...rest
    } = props;

    // Layout
    return <OptionGroup<T, D, L> row={row} size={size} sx={sx} {...rest} />;
}
