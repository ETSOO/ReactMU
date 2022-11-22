import { AddressRegionDb, RegionsRQ } from '@etsoo/appscript';
import { DataTypes } from '@etsoo/shared';
import React from 'react';
import { Tiplist, TiplistProps } from './Tiplist';

/**
 * Country list props
 */
export type CountryListProps = Omit<
    DataTypes.Optional<TiplistProps<AddressRegionDb, 'id'>, 'name'>,
    'loadData'
> & {
    /**
     * Load data
     * @param rq Request data
     * @returns Result
     */
    loadData: (rq: RegionsRQ) => Promise<AddressRegionDb[] | undefined>;

    /**
     * Load favored country ids
     * @returns Result
     */
    loadFavoredIds?: () => Promise<string[]>;

    /**
     * Max items to display
     */
    items?: number;
};

/**
 * Country list
 * @param props Props
 * @returns Component
 */
export function CountryList(props: CountryListProps) {
    // Destruct
    const {
        items = 16,
        loadData,
        loadFavoredIds,
        name = 'countryId',
        ...rest
    } = props;

    // Ref
    const favoredIds = React.useRef<string[]>([]);

    // Ready
    React.useEffect(() => {
        if (loadFavoredIds && favoredIds.current.length === 0)
            loadFavoredIds().then((ids) => {
                favoredIds.current = ids;
            });
    }, [loadFavoredIds]);

    // Layout
    return (
        <Tiplist<AddressRegionDb, 'id'>
            name={name}
            loadData={(keyword, id) =>
                loadData({ id, keyword, favoredIds: favoredIds.current, items })
            }
            {...rest}
        />
    );
}
